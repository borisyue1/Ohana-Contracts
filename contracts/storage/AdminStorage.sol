pragma solidity ^0.4.24;

/**
 * Separate logic code from data to make contracts upgradeable; i.e. can update transaction logic in the future without losing data
 */

contract AdminStorage {


    // Stores an admin's transfer allowances
    struct AdminData {
        uint256 totalTransferableBalance; // Total amount admin can transfer to users per month (from common pool)
        mapping (address => uint256) allowances; // Amount admin can tranfer to individual users each month (from common pool)
        // address[] teamMembers; 
    }

    mapping (address => bool) public admins; // Stores the admins
    mapping (address => AdminData) public adminData;  // Maps admins to various metadata
    mapping (address => bool) public accessAllowed;  // Stores who has access to call functions of this contract (Admin contract only)

    modifier hasAccess() {
    	require(accessAllowed[msg.sender]);
    	_;
    }

    constructor() public {
    	accessAllowed[msg.sender] = true;
    	// Owner is also an admin
        admins[msg.sender] = true;
    }

    function allowAccess(address _address) hasAccess external {
    	accessAllowed[_address] = true;
    }

    function denyAccess(address _address) hasAccess external {
    	accessAllowed[_address] = false;
    }

    function isAdmin(address _user) hasAccess external view returns (bool) {
    	return admins[_user];
    }

    function addAdmin(address user) hasAccess external {
    	require(!admins[user], "User is already an admin");
        admins[user] = true;
        // teamMembers = addresses;
    }

    function removeAdmin(address admin) hasAccess external {
    	require(admins[admin], "User is not an admin");
    	admins[admin] = false;
        delete adminData[admin];
    }

    function getAdminTransferableBalance(address admin) hasAccess external view returns (uint256) {
        return adminData[admin].totalTransferableBalance;
    }

    function getAdminUserAllowance(address admin, address user) hasAccess external view returns (uint256) {
        return adminData[admin].allowances[user];
    }

    function setAdminTransferableBalance(address admin, uint256 value) hasAccess external {
        adminData[admin].totalTransferableBalance = value;
    }

    function setAdminUserAllowance(address admin, address user, uint256 value) hasAccess external {
        adminData[admin].allowances[user] = value;
    }


}