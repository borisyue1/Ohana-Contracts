pragma solidity ^0.4.24;

import "./SafeMath.sol";
import "./Utilities.sol";


contract Owned {

    using SafeMath for uint256; // attaches the library's functions to uint256 type
    using Utilities for string;

    address public owner;

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Only the root account can execute this action");
        _;
    }
}