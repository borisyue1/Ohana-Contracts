pragma solidity ^0.4.24;

import "./Utilities.sol";
import "./Admin.sol";
import "./Owned.sol";
import "./Storage/OhanaCoinStorage.sol";


contract OhanaCoin is Owned {
    
    // Check for some conditions before transferring any coins
    modifier transferChecks(address _from, address _to, uint256 _value) {
        // Prevent transfer to 0x0 address. Use burn() instead
        require(_to != 0x0, "Invalid send address (0)");
        // Check if sender has transferred too much already
        if (_from != owner)
            require(coinStorage.getUserTransferredAmount(_from, _to).add(_value) <= userTransferAmountLimit, 
                "You have transferred too much to this user already");
        _;
    }

    modifier onlyAdmin {
        require(admin.isAdmin(msg.sender), "Only admins can execute this action");
        _;
    }
    
    // Public variables of the token
    string public name = "OhanaCoin";
    string public symbol = "OHN";
    uint256 public userTransferAmountLimit = 15; // How many coins a user can transfer total to another user in a given month
    // uint8 public userTransactionsLimit = 3; // How many transactions a user can make each month
    uint8 public monthlyAllowance = 30; // Monthly allowance of coins to users
    // uint256 public etherAmount = 1000; // How much ether is allocated to each user each month
    Admin admin;
    OhanaCoinStorage coinStorage;

    
    // This generates a public event on the blockchain that will notify clients (transaction)
    event Transfer(address indexed from, address indexed to, uint256 value, string message);
    event Burn(address indexed from, uint256 value, string balanceType, string burnType);
    event Reset(address indexed to);
    event Error(string message);
        
    /**
     * Constrctor function
     *
     * Initializes contract with initial supply tokens to the creator of the contract and ether
     */
    constructor(address adminContract, address storageContract) public payable {
        admin = Admin(adminContract); // Create an instance of the deployed Admin contract
        coinStorage = OhanaCoinStorage(storageContract); // Create an instance of the storage
        owner = msg.sender;                                     // Owner will mint new coins every month
    }

    /**
     * Internal transfer, only can be called by this contract. The tokens are transferred 
     * from the _from address's transferable balance to the _to address's transferable 
     * balance. This facilitates user to user transactions.
     * 
     * @param _from The address of the sender
     * @param _to The address of the recipient
     * @param _value The amount to send
     * @param _message The message to send along with the transfer
     */
    function _transferableToPersonal(address _from, address _to, uint _value, string _message) internal transferChecks(_from, _to, _value) {
        // Subtract from the sender
        coinStorage.setTransferableBalance(_from, coinStorage.getTransferableBalance(_from).sub(_value)); // using safemath library
        // balanceOf[_from].transferableBalance = balanceOf[_from].transferableBalance.sub(_value); 
        // Add the same to the recipient
        coinStorage.setPersonalBalance(_to, coinStorage.getPersonalBalance(_to).add(_value));
        // coinStorage.setNumTransfers(_from, coinStorage.getNumTransfers(_from) + 1);
        coinStorage.setUserTransferAmount(_from, _to, coinStorage.getUserTransferredAmount(_from, _to).add(_value));
        emit Transfer(_from, _to, _value, _message);
    }
    

    /**
     * Internal transfer, only can be called by this contract. The tokens are transfered 
     * to the _to address's personal balance. This facilitates user to user transactions.
     * 
     * @param _from The address of the sender
     * @param _to The address of the recipient
     * @param _value The amount to send
     * @param _message The message to send along with the transfer
     */
    function _personalToPersonal(address _from, address _to, uint _value, string _message) internal transferChecks(_from, _to, _value) {
         // Subtract from the sender
        coinStorage.setPersonalBalance(_from, coinStorage.getPersonalBalance(_from).sub(_value));
        // Add the same to the recipient
        coinStorage.setPersonalBalance(_to, coinStorage.getPersonalBalance(_to).add(_value));
        // coinStorage.setNumTransfers(_from, coinStorage.getNumTransfers(_from) + 1);
        coinStorage.setUserTransferAmount(_from, _to, coinStorage.getUserTransferredAmount(_from, _to).add(_value));
        emit Transfer(_from, _to, _value, _message);
    }
    
    /**
     * Transfer tokens to either the personal or transferable balance
     *
     * Send `_value` tokens to `_to` from your account
     *
     * @param _to The address of the recipient
     * @param _value The amount to send
     * @param fromBalance Which balance to withdraw from (Personal or Transferable)
     * @param _message The message to send along with the transfer
     */
    function transfer(address _to, uint256 _value, string fromBalance, string _message) external {
        if (Utilities.compareStrings(fromBalance, "Personal"))  
            _personalToPersonal(msg.sender, _to, _value, _message);
        else if (Utilities.compareStrings(fromBalance, "Transferable"))
            _transferableToPersonal(msg.sender, _to, _value, _message);
        else
            revert("fromBalance value is not valid");
    }
    
     /**
     * Transfer tokens from other address
     *
     * Send `_value` tokens to `_to` on behalf of msg.sender
     *
     * @param _to The address of the recipient
     * @param _value The amount to send
     * @param _message The message to send along with the transfer
     */
    function transferFrom(address _to, uint256 _value, string _message) external onlyAdmin returns (bool) {
        require(_value <= admin.getAdminTransferableBalance(msg.sender), "Admin has exceeded total transferable tokens limit");   
        require(_value <= admin.getAdminUserAllowance(msg.sender, _to), "Admin has transferred too many tokens to that user already"); 
        // if (_value > admin.getAdminTransferableBalance(msg.sender)) {
        //     emit Error("Admin has exceeded total transferable tokens limit");
        //     return false;
        // } 
        admin.reduceAdminTransferAllowance(msg.sender, _to, _value); // Update the balances/allownances
        _transferableToPersonal(owner, _to, _value, _message);         // Transfer to spending balance
        return true;
    }

    /**
     * Destroy tokens from _from account (only admins can execute this, for redeeming prizes)
     *
     * Remove `_value` tokens from the system irreversibly on behalf of `_from`.
     *
     * @param _from The address of the user to burn tokens from
     * @param _value The amount of tokens to burn
     */
    function adminBurnFrom(address _from, uint256 _value) external onlyAdmin returns (bool) {
        require(_value <= admin.getAdminBurnBalance(msg.sender), "Trying to burn more over limit");
        admin.setAdminBurnBalance(msg.sender, admin.getAdminBurnBalance(msg.sender).add(_value));
        coinStorage.setPersonalBalance(_from, coinStorage.getPersonalBalance(_from).sub(_value));
        coinStorage.setTotalSupply(coinStorage.totalSupply().sub(_value));
        emit Burn(_from, _value, "Personal", "Admin");
        return true;
    }   
    
    /**
     * Destroy tokens from _from account (only owner can execute this, is a scheduled burn)
     *
     * Remove `_value` tokens from the system irreversibly on behalf of `_from`.
     *
     * @param _from The address of the user to burn tokens from
     * @param _value The amount of money to burn
     * @param balanceType Which balance to burn from (Transferable or Personal)
     */
    function ownerBurnFrom(address _from, uint256 _value, string balanceType) public onlyOwner returns (bool) {
        if (Utilities.compareStrings(balanceType, "Transferable")) {    // Subtract from the targeted balance
            coinStorage.setTransferableBalance(_from, coinStorage.getTransferableBalance(_from).sub(_value));
        }
        else if (Utilities.compareStrings(balanceType, "Personal")) {
            coinStorage.setPersonalBalance(_from, coinStorage.getPersonalBalance(_from).sub(_value));
        }
        else { 
            revert();
        }
        coinStorage.setTotalSupply(coinStorage.totalSupply().sub(_value)); // Update totalSupply
        emit Burn(_from, _value, balanceType, "Owner");
        return true;
    }

    /** Burn balances, deposit monthly allowance and reset admin allowances. Called every four months
    *
    * @param _to The address to reset balances of
    */
    function resetBalances(address _to) external onlyOwner {
        // Burn the users balances
        uint256 transferableBalance = getTransferableBalance(_to);
        uint256 personalBalance = getPersonalBalance(_to);
        ownerBurnFrom(_to, transferableBalance, "Transferable");
        ownerBurnFrom(_to, personalBalance, "Personal");
        mintTokens(1000000); //add more tokens to the common pool
        depositAllowance(_to); // deposit the monthlyAllowance as well
        if (admin.isAdmin(_to)) {
            // if user is an admin, reset his/her allowances as well
            admin.resetAllowances(_to);
        }
        emit Reset(_to);
    }

    /**
    * Every month, every root account deposits monthlyAllowance tokens into user's transfer balance
    *
    * @param _to The address to deposit the allowance to
    */
    function depositAllowance(address _to) public onlyOwner {
        coinStorage.(_to); //reset the record of who _to has transferred to in the past month
        coinStorage.setTransferableBalance(_to, coinStorage.getTransferableBalance(_to).add(monthlyAllowance));
        coinStorage.setTransferableBalance(owner, coinStorage.getTransferableBalance(owner).sub(monthlyAllowance));
        _to.transfer(1 ether); // transfer ether to user to cover gas costs of transactions
        emit Transfer(owner, _to, monthlyAllowance, "");
    }
    
    /**
     * Owner of contract can mint new tokens
     * 
     * @param mintAmount The amount to create
     */
    function mintTokens(uint256 mintAmount) public onlyOwner {
        coinStorage.setTransferableBalance(owner, coinStorage.getTransferableBalance(owner).add(mintAmount));
        coinStorage.setTotalSupply(coinStorage.totalSupply().add(mintAmount));
        emit Transfer(0, owner, mintAmount, "");
    }

    function setUserTransferAmountLimit(uint256 limit) external onlyOwner {
        userTransferAmountLimit = limit;
    }

    function setMonthlyAllowance(uint8 value) external onlyOwner {
        monthlyAllowance = value;
    }

    function getTransferableBalance(address user) public view returns (uint256) {
        return coinStorage.getTransferableBalance(user);
    }

    function getPersonalBalance(address user) public view returns (uint256) {
        return coinStorage.getPersonalBalance(user);
    }

    function getNumTransferredUsers(address user) external view returns (uint256) {
        return coinStorage.getTransferredUsers(user).length;
    }

    function getTransferredUsers(address user) external view returns (address[]) {
        return coinStorage.getTransferredUsers(user);
    }

    function getUserTransferredAmount(address from, address to) external view returns (uint256) {
        return coinStorage.getUserTransferredAmount(from, to);
    }

    function getTotalSupply() external view returns (uint256) {
        return coinStorage.totalSupply();
    }

    function getPastBalances(address user) external view returns (uint256[], uint256) {
        return coinStorage.getPastBalances(user);
    }

    function storeBalance(address user) external onlyOwner {
        coinStorage.storeBalance(user);
    } 

    /** 
    * Fallback function to prevent accidental sending of ether to this contract
    */
    function () public payable {
        revert();
    }
    
}