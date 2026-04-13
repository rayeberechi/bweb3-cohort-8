// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {VulnerableContract} from "../src/VulnerableContract.sol";
import {FixedContract} from "../src/FixedContract.sol";
import {Attacker} from "../src/Attacker.sol";

contract VulnerableContractTest is Test {
    VulnerableContract public vulnerableContract;
    FixedContract public fixedContract;    

}