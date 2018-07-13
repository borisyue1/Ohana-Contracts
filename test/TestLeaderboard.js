var Leaderboard = artifacts.require("Leaderboard");

contract('Leaderboard', function(accounts) {

	// addBalance() basic test
	it("should add 3 users to the leaderboard in the correct order", async () => {
	    let instance = await Leaderboard.deployed();
	    await instance.resetLeaderboard();
	    await instance.addBalance(accounts[1], 1);
	    await instance.addBalance(accounts[2], 3);
	    await instance.addBalance(accounts[3], 2);
	    var first_user = await instance.getUser(1);
	    var second_user = await instance.getUser(2);
	    var third_user = await instance.getUser(3);
	    assert.equal(first_user[1], 3, "first place balance is wrong");
	    assert.equal(second_user[1], 2, "second place balance is wrong");
	    assert.equal(third_user[1], 1, "third place balance is wrong");
	    assert.equal(first_user[0], accounts[2], "first place user is wrong");
	    assert.equal(second_user[0], accounts[3], "second place user is wrong");
	    assert.equal(third_user[0], accounts[1], "third place user is wrong");
	});

	// addBalance() duplicate test #1
	it("should add 2 users to the leaderboard in the correct order", async () => {
	    let instance = await Leaderboard.deployed();
	    await instance.resetLeaderboard();
	    await instance.addBalance(accounts[1], 1);
	    await instance.addBalance(accounts[2], 3);
	    await instance.addBalance(accounts[1], 2);
	    var first_user = await instance.getUser(1);
	    var second_user = await instance.getUser(2);
	    var third_user = await instance.getUser(3); //shouldn't exist
	    assert.equal(first_user[1], 3, "first place balance is wrong");
	    assert.equal(second_user[1], 2, "second place balance is wrong");
	    assert.equal(third_user[1], 0, "third place balance is wrong");
	    assert.equal(first_user[0], accounts[2], "first place user is wrong");
	    assert.equal(second_user[0], accounts[1], "second place user is wrong");
	    assert.equal(third_user[0], 0, "third place user is wrong");
	});

	// addBalance() duplicate test #2 (5 -> 4 -> 3 -> 1)
	it("should add 4 users to the leaderboard in the correct order", async () => {
	    let instance = await Leaderboard.deployed();
	    await instance.resetLeaderboard();
	    await instance.addBalance(accounts[1], 3);
	    await instance.addBalance(accounts[2], 5);
	    await instance.addBalance(accounts[3], 2);
	    await instance.addBalance(accounts[3], 4);
	    await instance.addBalance(accounts[4], 1);
	    var first_user = await instance.getUser(1);
	    var second_user = await instance.getUser(2);
	    var third_user = await instance.getUser(3);
	    var fourth_user = await instance.getUser(4); 
	    var fifth_user = await instance.getUser(5); //shouldn't exist
	    assert.equal(first_user[1], 5, "first place balance is wrong");
	    assert.equal(second_user[1], 4, "second place balance is wrong");
	    assert.equal(third_user[1], 3, "third place balance is wrong");
	    assert.equal(fourth_user[1], 1, "fourth place balance is wrong");
	    assert.equal(fifth_user[1], 0, "fifth place balance is wrong");
	    assert.equal(first_user[0], accounts[2], "first place user is wrong");
	    assert.equal(second_user[0], accounts[3], "second place user is wrong");
	    assert.equal(third_user[0], accounts[1], "third place user is wrong");
	    assert.equal(fourth_user[0], accounts[4], "fourth place user is wrong");
	    assert.equal(fifth_user[0], 0, "fifth place user is wrong");
	});


});

