// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract FixedContract {
    mapping(address => uint256) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) public {
        // checks
        require(balances[msg.sender] >= amount, "Insufficient balance");

        // effects
        balances[msg.sender] -= amount;

        // interactions
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }
}