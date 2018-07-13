const OhanaCoin   = require('../contracts/OhanaCoin.js'),
	  Leaderboard = require('../contracts/Leaderboard.js');

const truffleConfig = require('../../truffle.js').networks.development;
const url = "http://" + truffleConfig.host + ':' + truffleConfig.port;

const Web3 	= require('web3'),
	  web3 	= new Web3(new Web3.providers.HttpProvider(url));
// 0xba21eac1ae5cafc66e3e5f1e49dea4be6a36c988
// 0x527f2e7a22a3038CA8503CE411C168D53bf1f553
web3.eth.defaultAccount = '0xBA21eac1ae5caFC66e3e5f1e49DeA4BE6a36c988';
const etherbase = web3.eth.defaultAccount;
const gasLimit = 1000000;
var coinInstance, leaderboardInstance; 
var personalBalance, transferableBalance;

OhanaCoin.deployed().then((instance) => {
	coinInstance = instance;
});

Leaderboard.deployed().then((instance) => {
	leaderboardInstance = instance;
});

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
			res.send({personal: personalBalance, transferable: transferableBalance});
		}, (error) => {
			res.send({ error: error.message});
		})
	}, (error) => {
	    res.send({ error: error.message});
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
	const password = req.body.password;
	web3.eth.personal.unlockAccount(etherbase, "root", 10).then(() => {
		return web3.eth.personal.newAccount(password);
	}).then((address) => {
		web3.eth.sendTransaction({
		   from: etherbase,
		   to: address,
		   value: web3.utils.toWei('1'),
		   gas: gasLimit,
		   gasPrice: 1,
		})
		.on('receipt', (receipt) => {
			// if (num == 3) { //3 blocks of confirmation for security (12 is max)
			//temporarily unlock account to make transaction
			web3.eth.personal.unlockAccount(address, password, 10).then((response) => {
				return coinInstance.depositAllowance(address, {from: etherbase, gas:gasLimit});
			}).then(() => {
				res.setHeader('Content-Type', 'application/json');
	        	res.send({ address: address });
			}).catch((error) => {
				res.send({ "deposit error": error.message});
			});;
			// } 
		})
		.on('error', (error) => {
			res.send({ "send error": error.message});
		});
	});
}

exports.getLogs = (req, res, next) => {
	const publicKey = req.body.userId;
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
		for (var i = events.length - 1; userEvents.length < 5 && i >= 0; i--) {
			if (events[i].args.from == publicKey || events[i].args.to == publicKey) 
				userEvents.push(events[i]);
		}
		res.send({events: userEvents});
	});
}
