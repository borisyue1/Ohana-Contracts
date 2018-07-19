pragma solidity ^0.4.24;

import "./Owned.sol";
import "./Storage/AdminStorage.sol";


contract Admin is Owned {


    event AdminAdded(address indexed user);
    event AdminRemoved(address indexed user);
    // event TeamMemberAdded(address indexed admin, address indexed user);
    // event TeamMemberRemoved(address indexed admin, address indexed user);

    uint256 public adminUserTransferLimit = 15; // How much an admin can transfer to a user per month (from common pool)
    uint256 public adminTotalTransferLimit = 500; // How much an admin can transfer total to users in a month (from common pool)
    uint256 public adminTotalBurnLimit = 500;

    modifier onlyAdmin {
        require(adminStorage.isAdmin(msg.sender), "Only admins can execute this action");
        _;
    }

    AdminStorage adminStorage;

    constructor (address storageContract) public {
        adminStorage = AdminStorage(storageContract);
    }

    /**
    * Checks if the user is an admin
    *
    * @param user The user to check
    */
    function isAdmin(address user) external view returns (bool) {
        return adminStorage.isAdmin(user);
    }

    /** Adds an admin to a team
    *
    * @param user The user to add as an admin
    * @param addresses The users that the admin can transfer tokens to (team members)
    */ 
    function addAdmin(address user, address[] addresses) external onlyAdmin {
        adminStorage.addAdmin(user, addresses); 
        adminStorage.setAdminTransferableBalance(user, adminTotalTransferLimit);
        adminStorage.setAdminBurnBalance(user, adminTotalBurnLimit);
        for (uint i = 0; i < addresses.length; i++) {
            address currentUser = addresses[i];
            adminStorage.addTeamMember(user, currentUser, adminUserTransferLimit); //add team member
        }
        emit AdminAdded(user);
    }

    /** Removes the user's admin status
    *
    * @param user The user to remove
    */ 
    function removeAdmin(address user) external onlyAdmin {
        adminStorage.removeAdmin(user);
        emit AdminRemoved(user);
    }

    function isTeamMember(address admin, address user) external view returns (bool) {
        return adminStorage.isTeamMember(admin, user);
    }

    function addTeamMember(address user) external onlyAdmin {
        adminStorage.addTeamMember(msg.sender, user, adminUserTransferLimit);
    }

    function removeTeamMember(address user) external onlyAdmin {
        address[] memory team = adminStorage.getTeamMembers(msg.sender);
        uint teamSize = team.length;
        for (uint i = 0; i < teamSize; i++) { //remove from team
            address currentUser = team[i];
            if (user == currentUser) {
                adminStorage.removeTeamMember(msg.sender, user, i); //pass in index so we know where to delete user in array
                break;
            }
        }
    }

    function getTeamMembers(address admin) external view returns (address[]) {
        return adminStorage.getTeamMembers(admin);
    }

    function getAdminTransferableBalance(address admin) external view returns (uint256) {
        return adminStorage.getAdminTransferableBalance(admin);
    }

    function getAdminBurnBalance(address admin) external view returns (uint256) {
        return adminStorage.getAdminBurnBalance(admin);
    }

    function getAdminUserAllowance(address admin, address user) external view returns (uint256) {
        return adminStorage.getAdminUserAllowance(admin, user);
    }

    function setAdminBurnBalance(address admin, uint256 value) external {
        adminStorage.setAdminBurnBalance(admin, value);
    }

    function reduceAdminTransferAllowance(address admin, address user, uint256 value) external {
        adminStorage.setAdminTransferableBalance(admin, adminStorage.getAdminTransferableBalance(admin).sub(value));
        adminStorage.setAdminUserAllowance(admin, user, adminStorage.getAdminUserAllowance(admin, user).sub(value));
    }

    function resetAllowances(address admin) external {
        require(tx.origin == owner, "Not the owner");
        adminStorage.setAdminTransferableBalance(admin, adminTotalTransferLimit);
        adminStorage.setAdminBurnBalance(admin, adminTotalBurnLimit);
        address[] memory team = adminStorage.getTeamMembers(admin);
        for (uint i = 0; i < team.length; i++) {
            adminStorage.setAdminUserAllowance(admin, team[i], adminUserTransferLimit);
        }
    }

    function setAdminUserTransferLimit(uint256 limit) external onlyOwner {
        adminUserTransferLimit = limit;
    }

    function setAdminTotalTransferLimit(uint256 limit) external onlyOwner {
        adminTotalTransferLimit = limit;
    }

    function setAdminTotalBurnLimit(uint256 limit) external onlyOwner {
        adminTotalBurnLimit = limit;
    }

    function getAdminUserTransferLimit() external view returns (uint256) {
        return adminUserTransferLimit;
    }

    function getAdminTotalTransferLimit() external view returns (uint256) {
        return adminTotalTransferLimit;
    }

    function getAdminTotalBurnLimit() external view returns (uint256) {
        return adminTotalBurnLimit;
    }

}