pragma solidity ^0.4.24;

/**
 * Separate logic code from data to make contracts upgradeable; i.e. can update transaction logic in the future without losing data
 */

contract OhanaCoinStorage {

	// Stores a user's balances
    struct Wallet {
        uint256 personalBalance;        // Personal balance for each user (used for prizes, etc)
        uint256 transferableBalance;    // Available coins to give to other users
        mapping (address => uint256) transferAmounts; // Amount user has transfered to another user so far in the month
        address[] transferredUsers; // Stores users that this user has transferred to in this month
        uint256[] pastTenBalances; // Stores users balances from past 10 days
        uint256 balancesStartIndex; // Stores index of oldest balance in pastTenBalances
    }

    mapping (address => Wallet) public balanceOf;    // Maps user to his/her balances
    mapping (address => bool) public accessAllowed;  // Stores who has access to call functions of this contract (OhanaCoin contract only)
    uint256 public totalSupply;

    modifier hasAccess() {
    	require(accessAllowed[msg.sender]);
    	_;
    }

    constructor(uint256 initialSupply) public {
    	accessAllowed[msg.sender] = true;
    	totalSupply = initialSupply;                               		// Set totalSupply
        balanceOf[msg.sender].transferableBalance = totalSupply;        // Give the creator all initial tokens
    }

    function allowAccess(address _address) hasAccess external {
    	accessAllowed[_address] = true;
    }

    function denyAccess(address _address) hasAccess external {
    	accessAllowed[_address] = false;
    }

    function getTransferableBalance(address user) external view returns (uint256) {
        return balanceOf[user].transferableBalance;
    }

    function getPersonalBalance(address user) external view returns (uint256) {
        return balanceOf[user].personalBalance;
    }

    // function getNumTransfers(address user) hasAccess external view returns (uint8) {
    //     return balanceOf[user].numTransfers;
    // }

    function getUserTransferredAmount(address from, address to) external view returns (uint256) {
        return balanceOf[from].transferAmounts[to];
    }

    function getTransferredUsers(address user) external view returns (address[]) {
        return balanceOf[user].transferredUsers;
    }

    function getPastBalances(address user) external view returns (uint256[], uint256) {
        return (balanceOf[user].pastTenBalances, balanceOf[user].balancesStartIndex);
    }

    function setUserTransferAmount(address from, address to, uint256 value) hasAccess external {
        if (balanceOf[from].transferAmounts[to] == 0) {
            balanceOf[from].transferredUsers.push(to); // haven't transferred to that user before, add to list
        }
        balanceOf[from].transferAmounts[to] = value;
    }

    function setTransferableBalance(address user, uint256 amount) hasAccess external {
    	balanceOf[user].transferableBalance = amount;
    }

    function setPersonalBalance(address user, uint256 amount) hasAccess external {
    	balanceOf[user].personalBalance = amount;
    }

    // function setNumTransfers(address user, uint8 amount) hasAccess external {
    // 	balanceOf[user].numTransfers = amount;
    // }

    function setTotalSupply(uint256 amount) hasAccess external {
        totalSupply = amount;
    }

    function storeBalance(address user) hasAccess external {
        uint arrSize = balanceOf[user].pastTenBalances.length;
        uint256 startIndex = balanceOf[user].balancesStartIndex;
        if (arrSize >= 10) {
            delete balanceOf[user].pastTenBalances[startIndex];
            balanceOf[user].balancesStartIndex += 1;
        }
        balanceOf[user].pastTenBalances.push(balanceOf[user].personalBalance); //add current balance to the front of array
    }

    function resetTransferredUsers(address user) hasAccess external {
        for (uint i = 0; i < balanceOf[user].transferredUsers.length; i++) {
            address currentUser = balanceOf[user].transferredUsers[i];
            delete balanceOf[user].transferAmounts[currentUser]; //resets to 0
        }
        delete balanceOf[user].transferredUsers;
    } 

}