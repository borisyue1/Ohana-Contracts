pragma solidity ^0.4.24;

/**
 * Separate logic code from data to make contracts upgradeable; i.e. can update transaction logic in the future without losing data
 */

contract AdminStorage {


    // Stores an admin's transfer allowances
    struct AdminData {
        uint256 totalTransferableBalance; // Total amount admin can transfer to users per month (from common pool)
        uint256 totalBurnedBalance; //Amount admin has burned from users this month
        mapping (address => uint256) allowances; // Amount admin can tranfer to individual users each month (from common pool)
        address[] teamMembers; // Team members that admin has privileges to transfer to
        mapping (address => bool) isTeamMember; // Indicates whether user is part of team 
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

    function addAdmin(address user, address[] addresses) hasAccess external {
    	require(!admins[user], "User is already an admin");
        admins[user] = true;
        // adminData[user].team.teamMembers = addresses;
    }

    function removeAdmin(address admin) hasAccess external {
    	require(admins[admin], "User is not an admin");
    	admins[admin] = false;
        //can't delete mappings, so have to manually set to false with for loop
        for (uint i = 0; i < adminData[admin].teamMembers.length; i++) {
            address user = adminData[admin].teamMembers[i];
            adminData[admin].isTeamMember[user] = false; 
        }
        delete adminData[admin];
    }

    function isTeamMember(address admin, address user) hasAccess external view returns (bool) {
        return adminData[admin].isTeamMember[user];
    }

    function addTeamMember(address admin, address user, uint256 value) hasAccess external {
        require(!adminData[admin].isTeamMember[user], "User is already part of team");
        adminData[admin].teamMembers.push(user);
        adminData[admin].isTeamMember[user] = true;
        setAdminUserAllowance(admin, user, value);
    }

    function removeTeamMember(address admin, address user, uint256 index) hasAccess public {
        require(adminData[admin].isTeamMember[user], "User is already not part of team");
        uint256 teamSize = adminData[admin].teamMembers.length;
        adminData[admin].teamMembers[index] = adminData[admin].teamMembers[teamSize - 1];
        adminData[admin].teamMembers.length--; //automatically clears up last element in array
        adminData[admin].isTeamMember[user] = false;
        delete adminData[admin].allowances[user];
    }

    function getTeamMembers(address admin) hasAccess external view returns (address[]) {
        return adminData[admin].teamMembers;
    }

    function getAdminTransferableBalance(address admin) hasAccess external view returns (uint256) {
        return adminData[admin].totalTransferableBalance;
    }

    function getAdminBurnBalance(address admin) hasAccess external view returns (uint256) {
        return adminData[admin].totalBurnedBalance;
    }

    function getAdminUserAllowance(address admin, address user) hasAccess external view returns (uint256) {
        return adminData[admin].allowances[user];
    }

    function setAdminTransferableBalance(address admin, uint256 value) hasAccess external {
        adminData[admin].totalTransferableBalance = value;
    }

    function setAdminUserAllowance(address admin, address user, uint256 value) hasAccess public {
        adminData[admin].allowances[user] = value;
    }

    function setAdminBurnBalance(address admin, uint256 value) hasAccess public {
        adminData[admin].totalBurnedBalance = value;
    }    


}