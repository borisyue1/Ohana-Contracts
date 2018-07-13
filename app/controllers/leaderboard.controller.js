const Leaderboard = require('../contracts/Leaderboard.js');

const truffleConfig = require('../../truffle.js').networks.development;
const url = "http://" + truffleConfig.host + ':' + truffleConfig.port;

const Web3 	= require('web3'),
	  web3 	= new Web3(new Web3.providers.HttpProvider(url));

web3.eth.defaultAccount = '0xba21eac1ae5cafc66e3e5f1e49dea4be6a36c988';
const etherbase = web3.eth.defaultAccount;
const gasLimit = 10000000;
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
			if (user == 0 && balance == 0) 
				return;
			else {
				dict = {"rank": i, "user": user, "balance": balance}; //convert to dictionary to make more readable
				users.push(dict);
			}
		}, (error) => {
			res.send({error: error.message})
		});
	}
	res.send({result: users});
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