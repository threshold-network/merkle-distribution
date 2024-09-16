// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Allows to claim the staking rewards of the Threshold Network.
interface IRewardsAggregator {
    // This event is triggered whenever a call to #setMerkleRoot succeeds.
    event MerkleRootUpdated(bytes32 oldMerkleRoot, bytes32 newMerkleRoot);
    // This event is triggered whenever a call to #claimMerkle succeeds.
    event MerkleClaimed(
        address indexed stakingProvider,
        uint256 amount,
        address beneficiary,
        bytes32 merkleRoot
    );
    // This event is triggered whenever a call to #setRewardsHolder succeeds.
    event RewardsHolderUpdated(
        address oldRewardsHolder,
        address newRewardsHolder
    );

    // Returns the address of the token distributed by this contract.
    function token() external view returns (address);

    // Returns the merkle root of the merkle tree containing cumulative account balances available to claim.
    function merkleRoot() external view returns (bytes32);

    // Returns the Merkle cumulative claimed rewards balance.
    function cumulativeMerkleClaimed(
        address stakingProvider
    ) external view returns (uint256);

    // Sets the merkle root of the merkle tree containing cumulative account balances available to claim.
    function setMerkleRoot(bytes32 merkleRoot_) external;

    // Sets the address from where Merkle rewards are being pulled.
    function setMerkleRewardsHolder(address rewardsHolder_) external;

    // Claim the given amount of the token to the given address. Reverts if the inputs are invalid.
    function claim(
        address stakingProvider,
        address beneficiary,
        uint256 cumulativeAmount,
        bytes32 expectedMerkleRoot,
        bytes32[] calldata merkleProof
    ) external;
}
