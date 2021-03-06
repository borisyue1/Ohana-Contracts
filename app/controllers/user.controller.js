const OhanaCoin   = require('../contracts/OhanaCoin.js'),
	  Leaderboard = require('../contracts/Leaderboard.js');

const config = require('../../config/config.js'),
	  web3 = config.web3.instance,
	  etherbase = web3.eth.defaultAccount.toLowerCase(),
 	  gasLimit = config.gasLimit,
 	  gasPrice = config.gasPrice;

var coinInstance, leaderboardInstance; 
var personalBalance, transferableBalance;

OhanaCoin.deployed().then((instance) => {
	coinInstance = instance;
});

Leaderboard.deployed().then((instance) => {
	leaderboardInstance = instance;
});

exports.getNumUsers = (req, res, next) => {
	res.setHeader('Content-Type', 'application/json');
	web3.eth.getAccounts()
	.then((accounts) => {
        res.send({ users: accounts.length });
	}, (error) => {
		res.send({error: error.message})
	});
}

exports.getBalances = (req, res, next) => {
	const publicKey = req.body.userId;
	res.setHeader('Content-Type', 'application/json');
	coinInstance.getPersonalBalance(publicKey)
	.then((personalBalance) => {
		coinInstance.getTransferableBalance(publicKey)
		.then((transferableBalance) => {
			res.send({personal: parseInt(personalBalance), transferable: parseInt(transferableBalance)});
		}, (error) => {
			res.send({ error: error.message});
		})
	}, (error) => {
	    res.send({ error: error.message});
	}); 
}

exports.getLogs = (req, res, next) => {
	const publicKey = req.body.userId;
	const numEvents = req.body.numEvents;
	res.setHeader('Content-Type', 'application/json');
	coinInstance.allEvents({
		// filter: {to: '0x2c9964f6c3517e06497c1547d795c6dfc86fb273'}, 
		fromBlock: 0, 
		toBlock: "latest",
		// from: "0x2c9964f6c3517e06497c1547d795c6dfc86fb273"
		// address: '0x2c9964f6c3517e06497c1547d795c6dfc86fb273'
	})
	.get((error, events) => {
		//manually get five latest events pertaining to specified user since filter parameter doesn't work 
		let userEvents = []
		for (var i = events.length - 1; userEvents.length < numEvents && i >= 0; i--) {
			let eventDict;
			let eventMessage;
			if (events[i].args.from == etherbase) {
				eventMessage = "Automated deposit upon registration.";
			} else {
				eventMessage = events[i].args.message;
			}
			if (events[i].args.from == publicKey || events[i].args.to == publicKey) {
				eventDict = {"eventType": events[i].event, "fromId": events[i].args.from, 
								 "toId": events[i].args.to, "value": events[i].args.value, "message": eventMessage};
				if (events[i].args.from == etherbase) {
					eventDict["transferType"] = "Automated Deposit";
				} else if (events[i].event === "Transfer" && events[i].args.to == publicKey) {
					eventDict["transferType"] = "Received Coins";
				} else if (events[i].event === "Transfer" && events[i].args.from == publicKey) {
					eventDict["transferType"] = "Transferred Coins";
				}
				userEvents.push(eventDict);
			}
		}
		res.send({events: userEvents});
	});
}

exports.getTransferredUsers = (req, res, next) => {
	const publicKey = req.body.userId;
	res.setHeader('Content-Type', 'application/json');
	coinInstance.getTransferredUsers(publicKey)
	.then((users) => {
        res.send({ users: users });
	}, (error) => {
		res.send({error: error.message})
	});
}

exports.getUserTransferredAmount = (req, res, next) => {
	const from = req.body.fromId;
	const to = req.body.toId;
	res.setHeader('Content-Type', 'application/json');
	coinInstance.getUserTransferredAmount(from, to)
	.then((amount) => {
        res.send({ amount: amount });
	}, (error) => {
		res.send({error: error.message})
	});
}

exports.getPastBalances = (req, res, next) => {
	const publicKey = req.body.userId;
	res.setHeader('Content-Type', 'application/json');
	coinInstance.getPastBalances(publicKey)
	.then((result) => {
		let past = [];
		let startIndex = result[1];
		let pastBalances = result[0];
		for (var i = startIndex; i < startIndex + 7; i++) {
			if (pastBalances[i] != null)
				past.push(parseInt(pastBalances[i])); 
			else
				past.push(0);
		}
        res.send({ result: past});
	}, (error) => {
		res.send({result: error.message})
	});
}

exports.transferTo = (req, res, next) => {
	const fromKey = req.body.userId;
	const toKey = req.body.toId;
	const value = req.body.value;
	const fromBalance = req.body.fromBalance;
	const message = req.body.message;
	const password = req.body.password;
	res.setHeader('Content-Type', 'application/json');
	web3.eth.personal.unlockAccount(fromKey, password, 0).then(() => {
		return coinInstance.transfer(toKey, value, fromBalance, message, {from: fromKey, gas:gasLimit, gasPrice:gasPrice}) 
	}).then((receipt) => {
		// res.send({receipt: receipt});
		return coinInstance.getPersonalBalance(toKey, {gas: gasLimit})
	}).catch((error) => {
		res.send({status: "error", result: error.message});
	}).then((balance) => {
		return leaderboardInstance.addBalance(toKey, balance, {from: fromKey, gas:gasLimit, gasPrice:gasPrice});
	}).catch((error) => {
		res.send({status: "error", result: error.message});
	}).then(() => {
		res.send({status: "success", result: "submitted to leaderboard" });
	});		
}

exports.registerUser = (req, res, next) => {
	res.setHeader('Content-Type', 'application/json');
	const password = req.body.password;
	web3.eth.personal.newAccount(password)
	.then((address) => {
		coinInstance.depositAllowance(address, {from: etherbase, gas:gasLimit})
		.then((receipt) => {
			// res.send({receipt: receipt});
        	res.send({ status:"success", result: address });
		}).catch((error) => {
			res.send({ status:"error", result: error.message});
		});
	});
}

