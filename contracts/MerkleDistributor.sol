// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@threshold-network/solidity-contracts/contracts/staking/IApplication.sol";

import "./interfaces/IMerkleDistributor.sol";

contract MerkleDistributor is Ownable, IMerkleDistributor {
    using SafeERC20 for IERC20;
    using MerkleProof for bytes32[];

    address public immutable override token;
    address public rewardsHolder;

    bytes32 public override merkleRoot;
    mapping(address => uint256) internal newCumulativeClaimed;

    // TODO: Generalize to an array of IApplication in the future.
    // For the moment, it will only be used for TACo app.
    IApplication public immutable application;

    IMerkleDistributor public immutable oldMerkleDistributor;

    struct Claim {
        address stakingProvider;
        address beneficiary;
        uint256 amount;
        bytes32[] proof;
    }

    constructor(
        address token_,
        IApplication application_,
        IMerkleDistributor _oldMerkleDistributor,
        address rewardsHolder_,
        address newOwner
    ) {
        require(IERC20(token_).totalSupply() > 0, "Token contract must be set");
        require(
            rewardsHolder_ != address(0),
            "Rewards Holder must be an address"
        );
        require(
            address(application_) != address(0),
            "Application must be an address"
        );
        require(
            token_ == _oldMerkleDistributor.token(),
            "Incompatible old MerkleDistributor"
        );

        transferOwnership(newOwner);
        token = token_;
        application = application_;
        rewardsHolder = rewardsHolder_;
        oldMerkleDistributor = _oldMerkleDistributor;
    }

    function setMerkleRoot(bytes32 merkleRoot_) external override onlyOwner {
        emit MerkleRootUpdated(merkleRoot, merkleRoot_);
        merkleRoot = merkleRoot_;
    }

    function setRewardsHolder(address rewardsHolder_) external onlyOwner {
        require(
            rewardsHolder_ != address(0),
            "Rewards holder must be an address"
        );
        emit RewardsHolderUpdated(rewardsHolder, rewardsHolder_);
        rewardsHolder = rewardsHolder_;
    }

    function cumulativeClaimed(
        address stakingProvider
    ) public view returns(uint256) {
        uint256 newAmount = newCumulativeClaimed[stakingProvider];
        if(newAmount > 0){
            return newAmount;
        } else {
            return oldMerkleDistributor.cumulativeClaimed(stakingProvider);
        }
    }

    // Claim the rewards that come from the distributions generated periodically
    // by the Merkle distribution script
    function claimWithoutApps(
        address stakingProvider,
        address beneficiary,
        uint256 cumulativeAmount,
        bytes32 expectedMerkleRoot,
        bytes32[] calldata merkleProof
    ) public {
        require(merkleRoot == expectedMerkleRoot, "Merkle root was updated");

        // Verify the merkle proof
        bytes32 leaf = keccak256(
            abi.encodePacked(stakingProvider, beneficiary, cumulativeAmount)
        );
        require(verify(merkleProof, expectedMerkleRoot, leaf), "Invalid proof");

        // Mark it claimed (potentially taking into consideration state in old
        // MerkleDistribution contract)
        uint256 preclaimed = cumulativeClaimed(stakingProvider);
        require(preclaimed < cumulativeAmount, "Nothing to claim");
        newCumulativeClaimed[stakingProvider] = cumulativeAmount;

        // Send the token
        unchecked {
            uint256 amount = cumulativeAmount - preclaimed;
            IERC20(token).safeTransferFrom(rewardsHolder, beneficiary, amount);
            emit Claimed(
                stakingProvider,
                amount,
                beneficiary,
                expectedMerkleRoot
            );
        }
    }

    // Claim the rewards that come from both the distributions generated
    // periodically by the Merkle distribution script and also those generated
    // by the Threshold application
    function claim(
        address stakingProvider,
        address beneficiary,
        uint256 cumulativeAmount,
        bytes32 expectedMerkleRoot,
        bytes32[] calldata merkleProof
    ) public {
        claimWithoutApps(
            stakingProvider,
            beneficiary,
            cumulativeAmount,
            expectedMerkleRoot,
            merkleProof
        );
        application.withdrawRewards(stakingProvider);
    }

    function batchClaimWithoutApps(
        bytes32 expectedMerkleRoot,
        Claim[] calldata Claims
    ) external {
        for (uint i; i < Claims.length; i++) {
            claimWithoutApps(
                Claims[i].stakingProvider,
                Claims[i].beneficiary,
                Claims[i].amount,
                expectedMerkleRoot,
                Claims[i].proof
            );
        }
    }

    function batchClaim(
        bytes32 expectedMerkleRoot,
        Claim[] calldata Claims
    ) external {
        for (uint i; i < Claims.length; i++) {
            claim(
                Claims[i].stakingProvider,
                Claims[i].beneficiary,
                Claims[i].amount,
                expectedMerkleRoot,
                Claims[i].proof
            );
        }
    }

    function verify(
        bytes32[] calldata merkleProof,
        bytes32 root,
        bytes32 leaf
    ) public pure returns (bool) {
        return merkleProof.verify(root, leaf);
    }
}
