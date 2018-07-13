pragma solidity ^0.4.24;

import "./Owned.sol";
import "./Storage/AdminStorage.sol";


contract Admin is Owned {


    event AdminAdded(address indexed user);
    event AdminRemoved(address indexed user);
    // event Hi(address user, uint256 length);

    uint256 public adminUserTransferLimit = 15; // How much an admin can transfer to a user per month (from common pool)
    uint256 public adminTotalTransferLimit = 500; // How much an admin can transfer total to users in a month (from common pool)

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
        // admins[user] = true;
        // adminData[user].totalTransferableBalance = adminTotalTransferLimit;
        adminStorage.addAdmin(user); 
        adminStorage.setAdminTransferableBalance(user, adminTotalTransferLimit);
        for (uint i = 0; i < addresses.length; i++) {
            address currentUser = addresses[i];
            adminStorage.setAdminUserAllowance(user, currentUser, adminUserTransferLimit); //add team member
            // adminData[user].allowances[currentUser] = adminUserTransferLimit; 
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

    function getAdminTransferableBalance(address admin) external view returns (uint256) {
        return adminStorage.getAdminTransferableBalance(admin);
    }

    function getAdminUserAllowance(address admin, address user) external view returns (uint256) {
        return adminStorage.getAdminUserAllowance(admin, user);
    }

    function reduceAdminTransferAllowance(address admin, address user, uint256 value) external {
        // adminData[admin].totalTransferableBalance = adminData[admin].totalTransferableBalance.sub(value);
        // adminData[admin].allowances[user] = adminData[admin].allowances[user].sub(value);
        adminStorage.setAdminTransferableBalance(admin, adminStorage.getAdminTransferableBalance(admin).sub(value));
        adminStorage.setAdminUserAllowance(admin, user, adminStorage.getAdminUserAllowance(admin, user).sub(value));
    }

    // ***function reset
    function resetAllowances(address admin) external {
        require(tx.origin == owner, "Not the owner");
        // adminData[admin].totalTransferableBalance = adminTotalTransferLimit;
        adminStorage.setAdminTransferableBalance(admin, adminTotalTransferLimit);
        // adminData[admin].allowances[user] = adminUserTransferLimit; iterate through team members
    }

    function setAdminUserTransferLimit(uint256 limit) external onlyOwner {
        adminUserTransferLimit = limit;
    }

    function setAdminTotalTransferLimit(uint256 limit) external onlyOwner {
        adminTotalTransferLimit = limit;
    }

    function getAdminUserTransferLimit() external view returns (uint256) {
        return adminUserTransferLimit;
    }

    function getAdminTotalTransferLimit() external view returns (uint256) {
        return adminTotalTransferLimit;
    }

}