// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@threshold-network/solidity-contracts/contracts/staking/IApplication.sol";

contract ApplicationMock is IApplication {
    function withdrawRewards(address stakingProvider) external {}

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

    // solc-ignore-next-line unused-param func-mutability
    function availableRewards(address stakingProvider)
        external
        view
        returns (uint96) {
            return 1000000000000000000;
        }

    // solc-ignore-next-line func-mutability
    function minimumAuthorization() external view returns (uint96) {
        return 40000;
    }
}
