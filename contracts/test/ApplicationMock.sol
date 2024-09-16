// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IApplication.sol";

contract ApplicationMock is IApplication {
    IERC20 public immutable token;

    constructor(IERC20 _token) {
        token = _token;
    }

    // For simplicity, we are not considering beneficiaries in this mock:
    // the staking provider address provided will receive the rewards
    function withdrawRewards(address stakingProvider) external {
        emit RewardsWithdrawn(stakingProvider, 10000);
        token.transfer(stakingProvider, 10000);
    }

    function authorizationIncreased(
        address stakingProvider,
        uint96 fromAmount,
        uint96 toAmount
    ) external {}

    function authorizationDecreaseRequested(
        address stakingProvider,
        uint96 fromAmount,
        uint96 toAmount
    ) external {}

    function involuntaryAuthorizationDecrease(
        address stakingProvider,
        uint96 fromAmount,
        uint96 toAmount
    ) external {}

    // solc-ignore-next-line func-mutability
    function availableRewards(
        // solc-ignore-next-line unused-param
        address stakingProvider
    ) external view returns (uint96) {
        return 100000;
    }

    // solc-ignore-next-line func-mutability
    function minimumAuthorization() external view returns (uint96) {
        return 40000;
    }
}
