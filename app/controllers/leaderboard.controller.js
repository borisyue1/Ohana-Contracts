const Leaderboard = require('../contracts/Leaderboard.js');

const config = require('../../config/config.js'),
	  web3 = config.web3.instance,
	  etherbase = web3.eth.defaultAccount,
 	  gasLimit = config.gasLimit;

var leaderboardInstance; 

Leaderboard.deployed().then((instance) => {
	leaderboardInstance = instance;
});

exports.getTopTen = async (req, res, next) => {
	res.setHeader('Content-Type', 'application/json');
	let users = [];
	for (let i = 1; i < 11; i++) {
		// we have to wait for results to populate users array
		await leaderboardInstance.getUser(i, {gas: gasLimit})
		.then((result) => {
			let user = result[0];
			let balance = result[1];
			if (user == 0 || user == 0x && balance == 0) //no user
				return;
			else {
				dict = {"rank": i, "user": user, "balance": balance}; //convert to dictionary to make more readable
				users.push(dict);
			}
		}, (error) => {
			res.send({error: error.message})
		});
	}
	res.send({users:users});
}

exports.resetLeaderboard = (req, res, next) => {
	const password = req.body.password;
	res.setHeader('Content-Type', 'application/json');
	web3.eth.personal.unlockAccount(etherbase, password, 10).then(() => {
		return leaderboardInstance.resetLeaderboard({from:etherbase, gas:gasLimit})
	}).then(() => {
		res.send({results:"leaderboard reset successfully!"})
	});
}