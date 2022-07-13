// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenStakingMock {

    address public immutable token;

    event ToppedUp(address indexed stakingProvider, uint96 amount);

    constructor(address token_) {
        token = token_;
    }

    function topUp(address stakingProvider, uint96 amount) external {
        require(amount > 0, "Parameters must be specified");
        emit ToppedUp(stakingProvider, amount);
        IERC20(token).transferFrom(msg.sender, address(this), amount);
    }
}
