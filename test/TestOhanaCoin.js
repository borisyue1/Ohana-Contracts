var OhanaCoin = artifacts.require("OhanaCoin");
var Admin = artifacts.require("Admin");

// TESTS DON'T RESET STATE

contract('OhanaCoin', function(accounts) {
	var transferLimit = 10;
	var transferAmount = 10;
	var burnAmount = 10;

	// setUserTransactionsLimit()
	it("should set the user to user transfer limit to 20", async () => {
		// Create an instance of OhanaCoin contract, wait til it's deployed
		let instance = await OhanaCoin.deployed();
		// Set the user transfer limit													
		await instance.setUserTransferAmountLimit(20, {from: accounts[0]});
		// Ensure that the limit has been set to 10
		assert.equal(await instance.userTransferAmountLimit(), 20, "user transfer limit wasn't set to 20");
	});

	// mintTokens()
	it("should mint 1000 tokens in the root account's transfer balance", async () => {
	    let instance = await OhanaCoin.deployed();
		let mintAmount = 1000;
	    let personalBalance = (await instance.getPersonalBalance(accounts[0])).toNumber();
	    let oldTransferBalance = (await instance.getTransferableBalance(accounts[0])).toNumber(); // Current transfer balance of root account
	    await instance.mintTokens(mintAmount, {from: accounts[0]})
	    let newTransferBalance = (await instance.getTransferableBalance(accounts[0])).toNumber();
	    assert.equal(personalBalance, 0, "root spend balance was changed after minting");
	    assert.equal(newTransferBalance, oldTransferBalance + mintAmount, "didn't mint 1000 tokens in root transfer balance");
	});

	// mintTokens()
	it("should fail because only root acount can mint tokens", async () => {
	    let instance = await OhanaCoin.deployed();
	    try {
	    	await instance.mintTokens(1000, {from: accounts[1]});
	    	// The line will only be hit if no error is thrown above!
    		throw new Error("Expected an error and didn't get one!");
	    } catch (err) {
    		assert.notEqual(err.message, "Expected an error and didn't get one!", "Got the wrong error");
	    }	   
	});

	// depositAllowance()
	it("should deposit 30 tokens into account 1's transfer balance from root", async () => {
	    let instance = await OhanaCoin.deployed();
	    let monthlyAllowance = await instance.monthlyAllowance();
	    await instance.mintTokens(transferAmount, {from: accounts[0]}) // Mint tokens first so we have something to transfer
	    let oldPersonalBalance = (await instance.getPersonalBalance(accounts[1])).toNumber();
	    let oldTransferBalance = (await instance.getTransferableBalance(accounts[1])).toNumber();
	    await instance.depositAllowance(accounts[1], {from: accounts[0]});
	    let newPersonalBalance = (await instance.getPersonalBalance(accounts[1])).toNumber();
	    let newTransferBalance = (await instance.getTransferableBalance(accounts[1])).toNumber();
    	assert.equal(oldTransferBalance + monthlyAllowance, newTransferBalance, "didn't deposit 10 tokens to account 1's transfer balance from root");
	    assert.equal(oldPersonalBalance, newPersonalBalance, "account 1's personal balance was changed after deposit");
	});

	// transfer(), transferableToPersonal
	it("should transfer 10 tokens from account 1's transferable balance to account 2's personal balance", async () => {
	    let instance = await OhanaCoin.deployed();
	   	await instance.depositAllowance(accounts[1], {from: accounts[0]}); // Transfer those tokens to account 1 transfer balance
	    let oldPersonalBalance = (await instance.getPersonalBalance(accounts[2])).toNumber();
	    let oldTransferBalance = (await instance.getTransferableBalance(accounts[2])).toNumber();
	    await instance.transfer(accounts[2], transferAmount, "Transferable", "", {from: accounts[1]});
	    let newPersonalBalance = (await instance.getPersonalBalance(accounts[2])).toNumber();
	    let newTransferBalance = (await instance.getTransferableBalance(accounts[2])).toNumber();
	    assert.equal(oldPersonalBalance + transferAmount, newPersonalBalance, "didn't transfer 10 tokens into account 2's personal balance");
	    assert.equal(oldTransferBalance, newTransferBalance, "account 2's transferable balance was changed after transfer from account 1");
	});

	// transfer(), personalToPersonal
	it("should transfer 10 tokens from account 1's personal balance to account 2's personal balance", async () => {
	    let instance = await OhanaCoin.deployed();
	   	await instance.depositAllowance(accounts[2], {from: accounts[0]}); // Transfer those tokens to account 2 transfer balance
	   	await instance.transfer(accounts[1], transferAmount, "Transferable", "", {from: accounts[2]}); // Transfer those tokens to account 1 personal balance
	    let oldPersonalBalance = (await instance.getPersonalBalance(accounts[2])).toNumber();
	    let oldTransferBalance = (await instance.getTransferableBalance(accounts[1])).toNumber(); // Account 1's transferable balance, not account 2
	    await instance.transfer(accounts[2], transferAmount, "Personal", "", {from: accounts[1]});
	    let newPersonalBalance = (await instance.getPersonalBalance(accounts[2])).toNumber();
	    let newTransferBalance = (await instance.getTransferableBalance(accounts[1])).toNumber(); // Account 1's transferable balance, not account 2
	    assert.equal(oldPersonalBalance + transferAmount, newPersonalBalance, "didn't transfer 10 tokens into account 2's personal balance");
	    assert.equal(oldTransferBalance, newTransferBalance, "account 1's transferable balance was changed after transfer from account 1");
	});

	// transfer()
	it("should fail because fromBalance value is not valid for transfer function", async () => {
	    let instance = await OhanaCoin.deployed();
	    await instance.mintTokens(transferAmount, {from: accounts[0]});
	    try {
	    	await instance.transfer(accounts[1], transferAmount, "Not a valid balance type!!", "", {from: accounts[0]});
	    	// The line will only be hit if no error is thrown above!
    		throw new Error("Expected an error and didn't get one!");
	    } catch (err) {
	    	assert.notEqual(err.message, "Expected an error and didn't get one!", "Got the wrong error");
	    }	   
	});

	// transfer()
	it("should error because account 1 is trying to transfer too much", async () => {
	    let instance = await OhanaCoin.deployed();
	    await instance.depositAllowance(accounts[1], {from: accounts[0]}); // Transfer those tokens to account 1 transfer balance
	    try {
	    	await instance.transfer(accounts[2], 25, "Transferable", "", {from: accounts[1]});
	    	// The line will only be hit if no error is thrown above!
    		throw new Error("Expected an error and didn't get one!");
	    } catch (err) {
	    	assert.notEqual(err.message, "Expected an error and didn't get one!", "Got the wrong error");
	    }	   
	});

	// transferFrom()
	it("should error because account 1 isn't authorized to withdraw tokens from root", async () => {
	    let instance = await OhanaCoin.deployed();
	    let admin = await Admin.deployed();
	    await instance.mintTokens(transferAmount, {from: accounts[0]}) // Mint tokens first so we have something to transfer
	    try {
	    	await instance.transferFrom(accounts[2], transferAmount, "", {from: accounts[1]});
	    	// The line will only be hit if no error is thrown above!
    		throw new Error("Expected an error and didn't get one!");
	    } catch (err) {
	    	assert.notEqual(err.message, "Expected an error and didn't get one!", "Got the wrong error");
	    }	
	});


	// transferFrom()
	it("should transfer 5 tokens from root acount's transfer balance to account 2's personal balance (transferFrom())", async () => {
	    let instance = await OhanaCoin.deployed();
	    let admin = await Admin.deployed();
	    let transferFromAmount = 5;
	    await instance.mintTokens(transferFromAmount, {from: accounts[0]}) // Mint tokens first so we have something to transfer
	    let oldPersonalBalance = (await instance.getPersonalBalance(accounts[2])).toNumber();
	    let oldTransferBalance = (await instance.getTransferableBalance(accounts[2])).toNumber();
	    await admin.addAdmin(accounts[1], [accounts[2]], {from: accounts[0]}); // Make account 1 an admin
	    await instance.transferFrom(accounts[2], transferFromAmount, "", {from: accounts[1]});
	    let newPersonalBalance = (await instance.getPersonalBalance(accounts[2])).toNumber();
	    let newTransferBalance = (await instance.getTransferableBalance(accounts[2])).toNumber();
	    assert.equal(oldPersonalBalance + transferFromAmount, newPersonalBalance, "didn't transfer 5 tokens to account 2's personal balance from root");
	    assert.equal(oldTransferBalance, newTransferBalance, "account 2's transfer balance was changed after transferFrom()");
	    let adminUserAllowance = await admin.getAdminUserAllowance(accounts[1], accounts[2]);
	    let adminTransferableBalance = await admin.getAdminTransferableBalance(accounts[1]);
	    assert.equal(adminUserAllowance, 10, "admin-user allowance wasn't reduced after transfer");
	    assert.equal(adminTransferableBalance, 495, "admin total transferable balance wasn't reduced after transfer");
	});

	// transferFrom(), transfer too much
	it("should error because account 1 is trying to transfer too much to account 2 (from common pool)", async () => {
	    let instance = await OhanaCoin.deployed();
	    let admin = await Admin.deployed();
	    let transferAmount = 10000;
	    await instance.mintTokens(transferAmount, {from: accounts[0]}) // Mint tokens first so we have something to transfer
	    await admin.removeAdmin(accounts[1], {from: accounts[0]}); // Remove account 1 as an admin
	    try {
	    	await instance.transferFrom(accounts[2], transferAmount, "", {from: accounts[1]});
	    	// The line will only be hit if no error is thrown above!
    		throw new Error("Expected an error and didn't get one!");
	    } catch (err) {
	    	assert.notEqual(err.message, "Expected an error and didn't get one!", "Got the wrong error");
	    }	
	});

	// ownerBurnFrom()
	it("should make root burn 10 tokens in the account 1's transfer balance", async () => {
	    let instance = await OhanaCoin.deployed();
	    await instance.depositAllowance(accounts[1], {from: accounts[0]}); // Transfer those tokens to account 1 transfer balance
	    let oldPersonalBalance = (await instance.getPersonalBalance(accounts[1])).toNumber();
	    let oldTransferBalance = (await instance.getTransferableBalance(accounts[1])).toNumber();
	    await instance.ownerBurnFrom(accounts[1], burnAmount, "Transferable", {from: accounts[0]});
	    let newPersonalBalance = (await instance.getPersonalBalance(accounts[1])).toNumber();
	    let newTransferBalance = (await instance.getTransferableBalance(accounts[1])).toNumber();
	    assert.equal(oldPersonalBalance, newPersonalBalance, "account 1's personal balance was changed after burning");
	    assert.equal(oldTransferBalance - burnAmount, newTransferBalance, "didn't burn 10 tokens in account 1's transfer balance");
	});

	// ownerBurnFrom()
	it("should make root burn 10 tokens in the account 3's personal balance", async () => {
	    let instance = await OhanaCoin.deployed();
	    await instance.depositAllowance(accounts[2], {from: accounts[0]}); // Transfer those tokens to account 2 transfer balance
	    await instance.transfer(accounts[3], burnAmount, "Transferable", "", {from: accounts[2]}); // Put those in account 3's personal balance
	    let oldPersonalBalance = (await instance.getPersonalBalance(accounts[3])).toNumber();
	    let oldTransferBalance = (await instance.getTransferableBalance(accounts[3])).toNumber();
	    await instance.ownerBurnFrom(accounts[3], burnAmount, "Personal", {from: accounts[0]});
	    let newPersonalBalance = (await instance.getPersonalBalance(accounts[3])).toNumber();
	    let newTransferBalance = (await instance.getTransferableBalance(accounts[3])).toNumber();
	    assert.equal(oldTransferBalance, newTransferBalance, "account 1's transferable balance was changed after burning");
	    assert.equal(oldPersonalBalance - burnAmount, newPersonalBalance, "didn't burn 10 tokens in account 1's personal balance");
	});

	// adminBurnFrom()
	it("should make account 1 burn 10 tokens in account 2's personal balance", async () => {
	    let instance = await OhanaCoin.deployed();
	    let admin = await Admin.deployed();
	    await instance.depositAllowance(accounts[1], {from: accounts[0]}); // Transfer those tokens to account 1 transfer balance
	    await instance.transfer(accounts[2], burnAmount, "Transferable", "", {from: accounts[1]}); // Put those in account 2's personal balance
	    await admin.addAdmin(accounts[1], [accounts[2]], {from: accounts[0]}); // Make account 1 an admin
	    let oldPersonalBalance = (await instance.getPersonalBalance(accounts[2])).toNumber();
	    let oldTransferBalance = (await instance.getTransferableBalance(accounts[2])).toNumber();
	    await instance.adminBurnFrom(accounts[2], burnAmount, {from: accounts[1]});
	    let newPersonalBalance = (await instance.getPersonalBalance(accounts[2])).toNumber();
	    let newTransferBalance = (await instance.getTransferableBalance(accounts[2])).toNumber();
	    assert.equal(oldTransferBalance, newTransferBalance, "account 2's transferable balance was changed after burning");
	    assert.equal(oldPersonalBalance - burnAmount, newPersonalBalance, "didn't burn 10 tokens in account 2's personal balance");
	});

	// adminBurnFrom()
	it("should error because account 1 is trying to burn too much from account 2", async () => {
	    let instance = await OhanaCoin.deployed();
	    let admin = await Admin.deployed();
	    try {
	    	await instance.adminBurnFrom(accounts[2], 1000, {from: accounts[1]});
	    	// The line will only be hit if no error is thrown above!
    		throw new Error("Expected an error and didn't get one!");
	    } catch (err) {
	    	assert.notEqual(err.message, "Expected an error and didn't get one!", "Got the wrong error");
	    }	
	});

	// adminBurnFrom()
	it("should error because account 1 isn't authorized to burn tokens from account 2's personal balance", async () => {
	    let instance = await OhanaCoin.deployed();
	    let admin = await Admin.deployed();
	    await admin.removeAdmin(accounts[1], {from: accounts[0]});
	    await instance.depositAllowance(accounts[2], {from: accounts[0]}); // Transfer those tokens to account 2 transfer balance
	    try {
	    	await instance.adminBurnFrom(accounts[2], burnAmount, {from: accounts[1]});
	    	// The line will only be hit if no error is thrown above!
    		throw new Error("Expected an error and didn't get one!");
	    } catch (err) {
	    	assert.notEqual(err.message, "Expected an error and didn't get one!", "Got the wrong error");
	    }	
	});

	// resetAllowances()
	it("should reset balances of account 1", async () => {
	    let instance = await OhanaCoin.deployed();
	    // let admin = await Admin.deployed();
	    // await admin.removeAdmin(accounts[1], {from: accounts[0]});
	    await instance.mintTokens(transferAmount * 2, {from: accounts[0]}) // Mint tokens first so we have something to transfer
	    await instance.depositAllowance(accounts[1], {from: accounts[0]}); // Deposit half those tokens to account 1 transfer balance
	    await instance.depositAllowance(accounts[2], {from: accounts[0]}); // Deposit other half to account 2 transfer balance
	    await instance.transfer(accounts[1], transferAmount, "Transferable", "", {from: accounts[2]}); // Transfer to account 1's personal balance
	    // Now, account 1 should have transferAmount in personal and transferable balance
	    await instance.transfer(accounts[2], 1, "Transferable", "", {from: accounts[1]}); // Increase account 1's num transfers by 1
	    let oldNumTransferred = (await instance.getNumTransferredUsers(accounts[1])).toNumber();
	    assert.equal(oldNumTransferred, 1, "account 1's num transferred users wasn't incremented after transfer");
	    // Now, reset the balances
	    await instance.resetBalances(accounts[1], {from: accounts[0]});
	    let personalBalance = (await instance.getPersonalBalance(accounts[1])).toNumber();
	    let transferBalance = (await instance.getTransferableBalance(accounts[1])).toNumber();
	    let newNumTransferred = (await instance.getNumTransferredUsers(accounts[1])).toNumber();
	    assert.equal(newNumTransferred, 0, "account 1's num transfers wasn't reset after transfer");
	    assert.equal(personalBalance, 0, "account 1's personal balance was't reset to 0");
	    assert.equal(transferBalance, 30, "account 1's transferable balance was't reset to 30");
	});

});

