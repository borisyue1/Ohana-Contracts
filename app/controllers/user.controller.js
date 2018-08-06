const OhanaCoin   = require('../contracts/OhanaCoin.js'),
	  Leaderboard = require('../contracts/Leaderboard.js');

const config = require('../../config/config.js'),
	  web3 = config.web3.instance,
	  etherbase = web3.eth.defaultAccount.toLowerCase(),
 	  gasLimit = config.gasLimit;

var coinInstance, leaderboardInstance; 
var personalBalance, transferableBalance;

OhanaCoin.deployed().then((instance) => {
	coinInstance = instance;
	// coinInstance.getTransferableBalance("0x60b60b61e1400db6028abf8bf43e1e8a3c911fb0").then(console.log)
});

Leaderboard.deployed().then((instance) => {
	leaderboardInstance = instance;
});

// const Contract = require("truffle-contract");

// const abi  = require('../../build/contracts/OhanaCoinStorage.json');

// // Read JSON and attach RPC connection (Provider)
// const storage = Contract(abi);
// storage.setProvider(web3.currentProvider);

// storage.deployed().then((instance) => {
// 	storageInstance = instance;
// 	console.log(storage.currentProvider)
// 	coinInstance.getTransferableBalance("0x60b60b61e1400db6028abf8bf43e1e8a3c911fb0").then(console.log)
// });
// IMPLEMENT ERROR HANDLING

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
		let pastTen = [];
		let startIndex = result[1];
		let pastBalances = result[0];
		// add to array in reverse order so that latest balances are first
		for (var i = startIndex + 10; i > startIndex && i >= 0; i--) {
			if (pastBalances[i] != null)
				pastTen.push(pastBalances[i]); 
		}
        res.send({ pastTen: pastTen});
	}, (error) => {
		res.send({error: error.message})
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
		return coinInstance.transfer(toKey, value, fromBalance, message, {from: fromKey, gas:gasLimit}) //emit event to update frontend balance
	}).then((receipt) => {
		// res.send({receipt: receipt});
		return coinInstance.getPersonalBalance(toKey, {gas: gasLimit})
	}).catch((error) => {
		res.send({error: error.message});
	}).then((balance) => {
		return leaderboardInstance.addBalance(toKey, balance, {from: fromKey, gas:gasLimit});
	}).then(() => {
		res.send({ result: "submitted to leaderboard" });
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
        	res.send({ address: address });
		}).catch((error) => {
			res.send({ "deposit error": error.message});
		});
		// web3.eth.sendTransaction({
		//    from: etherbase,
		//    to: address,
		//    value: web3.utils.toWei('1'),
		//    gas: gasLimit,
		//    gasPrice: 0,
		// })
		// .on('receipt', (receipt) => {
		// 	// if (num == 3) { //3 blocks of confirmation for security (12 is max)
		// 	//temporarily unlock account to make transaction
		// 	console.log(receipt);
		// 	coinInstance.depositAllowance(address, {from: etherbase, gas:gasLimit})
		// 	.then(() => {
		// 		res.setHeader('Content-Type', 'application/json');
	 //        	res.send({ address: address });
		// 	}).catch((error) => {
		// 		res.send({ "deposit error": error.message});
		// 	});
		// 	// } 
		// })
		// .on('error', (error) => {
		// 	res.send({ "send error": error.message});
		// });
	});
}

