var OhanaCoin = artifacts.require("OhanaCoin");

contract('OhanaCoin', function(accounts) {
	var transferLimit = 10;
	var transferAmount = 30;
	var burnAmount = 30;

	// setUserTransactionsLimit()
	it("should set the user transaction limit limit to 10", async () => {
		// Create an instance of OhanaCoin contract, wait til it's deployed
		let instance = await OhanaCoin.deployed();
		// Set the user transfer limit													
		await instance.setUserTransactionsLimit(10, {from: accounts[0]});
		// Ensure that the limit has been set to 10
		assert.equal(await instance.userTransactionsLimit(), 10, "user transfer limit wasn't set to 10");
	});

	// setAdminTransferAmountLimit()
	it("should set the admin transfer amount limit to 10", async () => {
		let instance = await OhanaCoin.deployed();
		await instance.setAdminTransferAmountLimit(10, {from: accounts[0]});
		assert.equal(await instance.adminTransferAmountLimit(), 10, "admin transfer limit wasn't set to 10");
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
	    	var expected = "VM Exception while processing transaction: revert";
    		assert.equal(err.message, expected, err.message);
	    }	   
	});

	// withdrawAllowance()
	it("should deposit 30 tokens into account 1's transfer balance from root", async () => {
	    let instance = await OhanaCoin.deployed();
	    await instance.mintTokens(transferAmount, {from: accounts[0]}) // Mint tokens first so we have something to transfer
	    let oldPersonalBalance = (await instance.getPersonalBalance(accounts[1])).toNumber();
	    let oldTransferBalance = (await instance.getTransferableBalance(accounts[1])).toNumber();
	    await instance.withdrawAllowance({from: accounts[1]});
	    let newPersonalBalance = (await instance.getPersonalBalance(accounts[1])).toNumber();
	    let newTransferBalance = (await instance.getTransferableBalance(accounts[1])).toNumber();
    	assert.equal(oldTransferBalance + transferAmount, newTransferBalance, "didn't deposit 30 tokens to account 1's transfer balance from root");
	    assert.equal(oldPersonalBalance, newPersonalBalance, "account 1's spend balance was changed after withdrawal");
	});

	// transfer(), transferableToPersonal
	it("should transfer 30 tokens from account 1's transferable balance to account 2's personal balance", async () => {
	    let instance = await OhanaCoin.deployed();
	    await instance.mintTokens(transferAmount, {from: accounts[0]}) // Mint tokens first so we have something to transfer
	   	await instance.withdrawAllowance({from: accounts[1]}) // Transfer those tokens to account 1 transfer balance
	    let oldPersonalBalance = (await instance.getPersonalBalance(accounts[2])).toNumber();
	    let oldTransferBalance = (await instance.getTransferableBalance(accounts[2])).toNumber();
	    await instance.transfer(accounts[2], transferAmount, "Transferable", {from: accounts[1]});
	    let newPersonalBalance = (await instance.getPersonalBalance(accounts[2])).toNumber();
	    let newTransferBalance = (await instance.getTransferableBalance(accounts[2])).toNumber();
	    assert.equal(oldPersonalBalance + transferAmount, newPersonalBalance, "didn't transfer 1000 tokens into account 2's personal balance");
	    assert.equal(oldTransferBalance, newTransferBalance, "account 2's transferable balance was changed after transfer from account 1");
	});

	// transfer(), personalToPersonal
	it("should transfer 30 tokens from account 1's personal balance to account 2's personal balance", async () => {
	    let instance = await OhanaCoin.deployed();
	    await instance.mintTokens(transferAmount, {from: accounts[0]}) // Mint tokens first so we have something to transfer
	   	await instance.withdrawAllowance({from: accounts[1]}) // Transfer those tokens to account 1 transfer balance
	    let oldPersonalBalance = (await instance.getPersonalBalance(accounts[2])).toNumber();
	    let oldTransferBalance = (await instance.getTransferableBalance(accounts[1])).toNumber(); // Account 1's transferable balance, not account 2
	    await instance.transfer(accounts[2], transferAmount, "Personal", {from: accounts[1]});
	    let newPersonalBalance = (await instance.getPersonalBalance(accounts[2])).toNumber();
	    let newTransferBalance = (await instance.getTransferableBalance(accounts[1])).toNumber(); // Account 1's transferable balance, not account 2
	    assert.equal(oldPersonalBalance + transferAmount, newPersonalBalance, "didn't transfer 1000 tokens into account 2's personal balance");
	    assert.equal(oldTransferBalance, newTransferBalance, "account 1's transferable balance was changed after transfer from account 1");
	});

	// transfer()
	it("should fail because fromBalance value is not valid for transfer function", async () => {
	    let instance = await OhanaCoin.deployed();
	    await instance.mintTokens(transferAmount, {from: accounts[0]});
	    try {
	    	await instance.transfer(accounts[1], transferAmount, "Not a valid balance type!!", {from: accounts[0]});
	    	// The line will only be hit if no error is thrown above!
    		throw new Error("Expected an error and didn't get one!");
	    } catch (err) {
	    	var expected = "VM Exception while processing transaction: revert";
    		assert.equal(err.message, expected, err.message);
	    }	   
	});

	// authorizeTransfer(), transferFrom()
	it("should transfer 5 tokens from root acount's transfer balance to account 2's personal balance (transferFrom())", async () => {
	    let instance = await OhanaCoin.deployed();
	    let transferFromAmount = 5;
	    await instance.mintTokens(transferFromAmount, {from: accounts[0]}) // Mint tokens first so we have something to transfer
	    let oldPersonalBalance = (await instance.getPersonalBalance(accounts[2])).toNumber();
	    let oldTransferBalance = (await instance.getTransferableBalance(accounts[2])).toNumber();
	    await instance.authorizeTransfer(accounts[1], transferFromAmount, {from: accounts[0]}); // Approves account 1 to transfer from root account
	    await instance.transferFrom(accounts[2], transferFromAmount, {from: accounts[1]});
	    let newPersonalBalance = (await instance.getPersonalBalance(accounts[2])).toNumber();
	    let newTransferBalance = (await instance.getTransferableBalance(accounts[2])).toNumber();
	    assert.equal(oldPersonalBalance + transferFromAmount, newPersonalBalance, "didn't transfer 5 tokens to account 2's personal balance from root");
	    assert.equal(oldTransferBalance, newTransferBalance, "account 2's transfer balance was changed after transferFrom()");
	});

	// transferFrom()
	it("should error because account 1 isn't authorized to withdraw tokens from root", async () => {
	    let instance = await OhanaCoin.deployed();
	    await instance.mintTokens(transferAmount, {from: accounts[0]}) // Mint tokens first so we have something to transfer
	    try {
	    	await instance.transferFrom(accounts[2], transferAmount, {from: accounts[1]});
	    	// The line will only be hit if no error is thrown above!
    		throw new Error("Expected an error and didn't get one!");
	    } catch (err) {
	    	var expected = "VM Exception while processing transaction: revert";
    		assert.equal(err.message, expected, err.message);
	    }	
	});

	// ownerBurnFrom()
	it("should make root burn 30 tokens in the account 1's transfer balance", async () => {
	    let instance = await OhanaCoin.deployed();
	    await instance.mintTokens(burnAmount, {from: accounts[0]}) // Mint tokens first so we have something to burn
	    await instance.withdrawAllowance({from: accounts[1]}) // Transfer those tokens to account 1 transfer balance
	    let oldPersonalBalance = (await instance.getPersonalBalance(accounts[1])).toNumber();
	    let oldTransferBalance = (await instance.getTransferableBalance(accounts[1])).toNumber();
	    await instance.ownerBurnFrom(accounts[1], burnAmount, "Transferable", {from: accounts[0]});
	    let newPersonalBalance = (await instance.getPersonalBalance(accounts[1])).toNumber();
	    let newTransferBalance = (await instance.getTransferableBalance(accounts[1])).toNumber();
	    assert.equal(oldPersonalBalance, newPersonalBalance, "account 1's personal balance was changed after burning");
	    assert.equal(oldTransferBalance - burnAmount, newTransferBalance, "didn't burn 30 tokens in account 1's transfer balance");
	});

	// ownerBurnFrom()
	it("should make root burn 30 tokens in the account 1's personal balance", async () => {
	    let instance = await OhanaCoin.deployed();
	    await instance.mintTokens(burnAmount, {from: accounts[0]}) // Mint tokens first so we have something to burn
	    await instance.withdrawAllowance({from: accounts[1]}) // Transfer those tokens to account 1 transfer balance
	    let oldPersonalBalance = (await instance.getPersonalBalance(accounts[1])).toNumber();
	    let oldTransferBalance = (await instance.getTransferableBalance(accounts[1])).toNumber();
	    await instance.ownerBurnFrom(accounts[1], burnAmount, "Personal", {from: accounts[0]});
	    let newPersonalBalance = (await instance.getPersonalBalance(accounts[1])).toNumber();
	    let newTransferBalance = (await instance.getTransferableBalance(accounts[1])).toNumber();
	    assert.equal(oldTransferBalance, newTransferBalance, "account 1's transferable balance was changed after burning");
	    assert.equal(oldPersonalBalance - burnAmount, newPersonalBalance, "didn't burn 30 tokens in account 1's personal balance");
	});

	// authorizeBurn(), adminBurnFrom()
	it("should make account 1 burn 30 tokens in account 2's personal balance", async () => {
	    let instance = await OhanaCoin.deployed();
	    await instance.mintTokens(burnAmount, {from: accounts[0]}) // Mint tokens first so we have something to burn
	    await instance.withdrawAllowance({from: accounts[2]}) // Transfer those tokens to account 2 transfer balance
	    let oldPersonalBalance = (await instance.getPersonalBalance(accounts[2])).toNumber();
	    let oldTransferBalance = (await instance.getTransferableBalance(accounts[2])).toNumber();
	   	await instance.authorizeBurn(accounts[1], burnAmount, {from: accounts[2]}); // Approves account 1 to transfer from root account
	    await instance.adminBurnFrom(accounts[2], burnAmount, {from: accounts[1]});
	    let newPersonalBalance = (await instance.getPersonalBalance(accounts[2])).toNumber();
	    let newTransferBalance = (await instance.getTransferableBalance(accounts[2])).toNumber();
	    assert.equal(oldTransferBalance, newTransferBalance, "account 2's transferable balance was changed after burning");
	    assert.equal(oldPersonalBalance - burnAmount, newPersonalBalance, "didn't burn 30 tokens in account 2's personal balance");
	});

	// authorizeBurn(), adminBurnFrom()
	it("should error because account 1 isn't authorized to burn tokens from account 2's personal balance", async () => {
	    let instance = await OhanaCoin.deployed();
	    await instance.mintTokens(burnAmount, {from: accounts[0]}) // Mint tokens first so we have something to transfer
	    await instance.withdrawAllowance({from: accounts[2]}) // Transfer those tokens to account 2 transfer balance
	    try {
	    	await instance.adminBurnFrom(accounts[2], burnAmount, {from: accounts[1]});
	    	// The line will only be hit if no error is thrown above!
    		throw new Error("Expected an error and didn't get one!");
	    } catch (err) {
	    	var expected = "VM Exception while processing transaction: revert";
    		assert.equal(err.message, expected, err.message);
	    }	
	});

});

