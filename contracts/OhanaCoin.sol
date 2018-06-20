pragma solidity ^0.4.24;

import "./Utilities.sol";


contract Owned {

    address public owner;

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Only the root account can execute this action");
        _;
    }

    function transferOwnership(address newOwner) internal onlyOwner {
        owner = newOwner;
    }
}

contract OhanaCoin is Owned {
    
    // Stores a user's balances
    struct Wallet {
        uint256 personalBalance;        // Personal balance for each user (used for prizes, etc)
        uint256 transferableBalance;    // Available coins to give to other users
        uint8 numTransfers;             // Amount of transfers each user has made in a quarter
    }

    // Stores a user's burn and transfer allowances
    struct Allowances {
        uint256 transferAllowance;
        uint256 burnAllowance;
    }
    
    // Check for some conditions before transferring any coins
    modifier transferChecks(address _from, address _to, uint _value) {
        // Prevent transfer to 0x0 address. Use burn() instead
        require(_to != 0x0, "Invalid send address (0)");
        // Check if the sender has enough
        require(balanceOf[_from].transferableBalance >= _value, "User does not have enough tokens to transfer");
        // Check if sender has transferred too many times already
        if (msg.sender != owner)
            require(balanceOf[_from].numTransfers < userTransactionsLimit - 1, "User has already made 3 transactions");
        _;
    }
    
    // Public variables of the token
    string public name = "OhanaCoin";
    string public symbol = "OHN";
    uint8 public userTransactionsLimit = 3;
    uint8 public adminTransferAmountLimit = 5;
    uint8 public monthlyAllowance = 30;
    uint256 public etherAmount = 1000; // How much ether is allocated to each user
    uint256 public totalSupply;
    
    // This creates an array with all balances
    mapping (address => Wallet) public balanceOf;                           // Maps user to his/her balances
    mapping (address => mapping (address => Allowances)) public allowance;  // Users that are allowed to transfer/burns other users' coins (admins)
    
    // This generates a public event on the blockchain that will notify clients (transaction)
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value, string approvalType);
    event Burn(address indexed from, uint256 value, string balanceType, string burnType);
        
    /**
     * Constrctor function
     *
     * Initializes contract with initial supply tokens to the creator of the contract
     */
    constructor(uint256 initialSupply) public payable {
        owner = msg.sender;                                     // Owner will mint new coins every month
        totalSupply = initialSupply;                            // Set totalSupply
        balanceOf[owner].transferableBalance = totalSupply;        // Give the creator all initial tokens
        emit Transfer(0, owner, totalSupply);
    }
    
    /**
     * Internal transfer, only can be called by this contract. The tokens are transferred 
     * from the _from address's transferable balance to the _to address's transferable 
     * balance. This facilitates user to user transactions.
     * 
     * @param _from The address of the sender
     * @param _to The address of the recipient
     * @param _value The amount to send
     */
    function _transferableToPersonal(address _from, address _to, uint _value) internal transferChecks(_from, _to, _value) {
        // Check for overflows
        require(balanceOf[_to].personalBalance + _value > balanceOf[_to].personalBalance, "Overflow");
        // Save this for an assertion in the future
        uint previousBalances = balanceOf[_from].transferableBalance + balanceOf[_to].personalBalance;
        // Subtract from the sender
        balanceOf[_from].transferableBalance -= _value;
        // Add the same to the recipient
        balanceOf[_to].personalBalance += _value;
        emit Transfer(_from, _to, _value);
        // Asserts are used to use static analysis to find bugs in your code. They should never fail
        assert(balanceOf[_from].transferableBalance + balanceOf[_to].personalBalance == previousBalances);
        balanceOf[msg.sender].numTransfers += 1;
    }
    

    /**
     * Internal transfer, only can be called by this contract. The tokens are transfered 
     * to the _to address's personal balance. This facilitates user to user transactions.
     * 
     * @param _from The address of the sender
     * @param _to The address of the recipient
     * @param _value The amount to send
     */
    function _personalToPersonal(address _from, address _to, uint _value) internal transferChecks(_from, _to, _value) {
        // Check for overflows
        require(balanceOf[_to].personalBalance + _value > balanceOf[_to].personalBalance, "Overflow");
        // Save this for an assertion in the future
        uint previousBalances = balanceOf[_from].personalBalance + balanceOf[_to].personalBalance;
        // Subtract from the sender
        balanceOf[_from].personalBalance -= _value;
        // Add the same to the recipient
        balanceOf[_to].personalBalance += _value;
        emit Transfer(_from, _to, _value);
        // Asserts are used to use static analysis to find bugs in your code. They should never fail
        assert(balanceOf[_from].personalBalance + balanceOf[_to].personalBalance == previousBalances);
        balanceOf[msg.sender].numTransfers += 1;
    }
    
    /**
     * Transfer tokens to either the personal or transferable balance
     *
     * Send `_value` tokens to `_to` from your account
     *
     * @param _to The address of the recipient
     * @param _value The amount to send
     * @param fromBalance Which balance to withdraw from (Personal or Transferrable)
     */
    function transfer(address _to, uint256 _value, string fromBalance) external {
        if (Utilities.compareStrings(fromBalance, "Personal")) 
            _personalToPersonal(msg.sender, _to, _value);
        else if (Utilities.compareStrings(fromBalance, "Transferable"))
            _transferableToPersonal(msg.sender, _to, _value);
        else
            revert("fromBalance value is not valid");
    }
    
     /**
     * Transfer tokens from other address
     *
     * Send `_value` tokens to `_to` in behalf of `_from`
     *
     * @param _to The address of the recipient
     * @param _value The amount to send
     */
    function transferFrom(address _to, uint256 _value) external returns (bool success) {
        require(_value <= allowance[owner][msg.sender].transferAllowance, "User does not have permission to transfer");    // Check allowance
        require(_value <= adminTransferAmountLimit, "Admin is transferring more than the limit");    // Admins can't transfer more than a certain amount
        allowance[owner][msg.sender].transferAllowance -= _value;
        _transferableToPersonal(owner, _to, _value);         // Transfer to spending balance
        return true;
    }

    /**
     * Set transfer allowance for other address (only owner can authorize) 
     *
     * Allows `msg.sender` to spend no more than `_value` tokens on owner's behalf
     *
     * @param _value The max amount they can spend
     */
    function authorizeTransfer(address _spender, uint256 _value) external onlyOwner returns (bool success) {
        require(_value <= adminTransferAmountLimit, "Admin wants to transfer more than the limit");    // Admins can't transfer more than a certain amount
        require(_value <= balanceOf[owner].transferableBalance, "Owner does not have enough tokens");    // Make sure owner has enough tokens
        allowance[owner][_spender].transferAllowance = _value;      // Admin can send coins from central owner to users
        emit Approval(owner, _spender, _value, "Transfer");
        return true;
    }

    /**
     * Set burn allowance for other address 
     *
     * Allows `_spender` (admin) to burn no more than `_value` tokens on msg.sender's (regular user) behalf
     *
     * @param _spender The address of the admin 
     * @param _value The max amount they can burn
     */
    function authorizeBurn(address _spender, uint256 _value) external returns (bool success) {
        require(_value <= balanceOf[msg.sender].personalBalance, "Admin is trying to transfer too many tokens"); // Admins can't burn more than a certain amount
        allowance[msg.sender][_spender].burnAllowance = _value;
        emit Approval(msg.sender, _spender, _value, "Burn");            
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
    function adminBurnFrom(address _from, uint256 _value) external returns (bool success) {
        require(_value <= allowance[_from][msg.sender].burnAllowance);
        require(balanceOf[_from].personalBalance >= _value);   // Check if the targeted balance is enough
        balanceOf[_from].personalBalance -= _value;
        totalSupply -= _value;
        allowance[_from][msg.sender].burnAllowance -= _value;  // Subtract from the sender's (admin's) allowance
        emit Burn(_from, _value, "Personal", "Admin");
        return true;
    }   
    
    /**
     * Destroy tokens from _from account (only owner can execute this, is a scheduled burn)
     *
     * Remove `_value` tokens from the system irreversibly on behalf of `_from`.
     *
     * @param _from The address of the sender
     * @param _value The amount of money to burn
     * @param balanceType Which balance to burn from (Transferable or Personal)
     */
    function ownerBurnFrom(address _from, uint256 _value, string balanceType) external onlyOwner returns (bool success) {
        if (Utilities.compareStrings(balanceType, "Transferable")) {    // Subtract from the targeted balance
            require(balanceOf[_from].transferableBalance >= _value);
            balanceOf[_from].transferableBalance -= _value;  
        }
        else if (Utilities.compareStrings(balanceType, "Personal")) {
            require(balanceOf[_from].personalBalance >= _value); 
            balanceOf[_from].personalBalance -= _value;
        }
        else { 
            revert();
        }
        totalSupply -= _value;                                         // Update totalSupply
        emit Burn(_from, _value, balanceType, "Owner");
        return true;
    }

    /**
    * Every month, every user withdraws monthlyAllowance tokens from root account into his/her transfer balance
    */
    function withdrawAllowance() external {
        require(balanceOf[owner].transferableBalance >= monthlyAllowance);
        balanceOf[msg.sender].transferableBalance += monthlyAllowance;
        balanceOf[owner].transferableBalance -= monthlyAllowance;
        msg.sender.transfer(etherAmount); // transfer ether to user to cover gas costs of transactions
        emit Transfer(owner, msg.sender, monthlyAllowance);
    }
    
    /**
     * Owner of contract can mint new tokens
     * 
     * @param mintAmount The amount to create
     */
    function mintTokens(uint256 mintAmount) external onlyOwner {
        balanceOf[owner].transferableBalance += mintAmount;
        totalSupply += mintAmount;
        emit Transfer(0, owner, mintAmount);
    }
    
    function setUserTransactionsLimit(uint8 limit) external onlyOwner {
        userTransactionsLimit = limit;
    }
    
    function setAdminTransferAmountLimit(uint8 limit) external onlyOwner {
        adminTransferAmountLimit = limit;
    }

    function setMonthlyAllowance(uint8 value) external onlyOwner {
        monthlyAllowance = value;
    }

    function getTransferableBalance(address user) external view returns (uint256 balance) {
        return balanceOf[user].transferableBalance;
    }

    function getPersonalBalance(address user) external view returns (uint256 balance) {
        return balanceOf[user].personalBalance;
    }

    /** 
    * Fallback function to prevent accidental sending of ether to this contract
    */
    function () public payable {
    }
    
}