var Admin = artifacts.require("Admin");

contract('Admin', function(accounts) {


	// setAdminUserTransferLimit()
	it("should set the admin to user transfer amount limit to 10", async () => {
		let instance = await Admin.deployed();
		await instance.setAdminUserTransferLimit(10, {from: accounts[0]});
		assert.equal(await instance.adminUserTransferLimit(), 10, "admin-user transfer limit wasn't set to 10");
	});

	// removeAdmin()
	it("should add and then remove account 1 as an admin", async () => {
		let instance = await Admin.deployed();
		await instance.addAdmin(accounts[1], [accounts[2]], {from: accounts[0]});
		await instance.removeAdmin(accounts[1], {from: accounts[0]});
		assert.equal(await instance.isAdmin(accounts[1]), false, "account 1 was't removed as an admin");
	});

	// addAdmin(), getAdminUserAllowance(), reduceAdminTransferAllowance()
	it("should add account 1 as an admin and account 2 as a team member", async () => {
		let instance = await Admin.deployed();
		await instance.addAdmin(accounts[1], [accounts[2]], {from: accounts[0]});
		assert.equal(await instance.isAdmin(accounts[1]), true, "account 1 wasn't made an admin");
		let oldAdminUserAllowance = (await instance.getAdminUserAllowance(accounts[1], accounts[2])).toNumber()
		assert.equal(oldAdminUserAllowance, 10, "account 1 can't transfer to account 2");
		await instance.reduceAdminTransferAllowance(accounts[1], accounts[2], 5);
		let newAdminUserAllowance = (await instance.getAdminUserAllowance(accounts[1], accounts[2])).toNumber()
		assert.equal(newAdminUserAllowance, 5, "account 1 transfer allowance to account 2 wasn't updated");
	});

	// addAdmin() error
	it("should fail because account 3 isn't an admin", async () => {
		let instance = await Admin.deployed();
		try {
	    	await instance.addAdmin(accounts[2], [], {from: accounts[3]});
	    	// The line will only be hit if no error is thrown above!
    		throw new Error("Expected an error and didn't get one!");
	    } catch (err) {
	    	assert.notEqual(err.message, "Expected an error and didn't get one!", "Got the wrong error");
	    }	
	});

});

