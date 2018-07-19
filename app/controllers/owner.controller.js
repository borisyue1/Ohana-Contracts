const OhanaCoin  = require('../contracts/OhanaCoin.js');

const config = require('../../config/config.js'),
	  web3 = config.web3.instance,
	  etherbase = web3.eth.defaultAccount,
 	  gasLimit = config.gasLimit;

var coinInstance; 

OhanaCoin.deployed().then((instance) => {
	coinInstance = instance;
});

exports.burnFrom = (req, res, next) => {
	const toKey = req.body.toId;
	const value = req.body.value;
	const balanceType = req.body.balanceType;
	const password = req.body.password;
	res.setHeader('Content-Type', 'application/json');
	web3.eth.personal.unlockAccount(etherbase, password, 3).then((response) => {
		return coinInstance.ownerBurnFrom(toKey, value, balanceType, {from: etherbase, gas: gasLimit})
	}).catch((error) => {
		res.send({ error: error.message });
	}).then((result) => {
		if (balanceType == "Transferable") 
			return coinInstance.getTransferableBalance(toKey, {gas: gasLimit})
		else
			return coinInstance.getPersonalBalance(toKey, {gas: gasLimit})
	}).then((balance) => {
		res.send({ balance: balance });
	});
}

exports.depositAllowance = async (req, res, next) => {
	const password = req.body.password;
	const toKey = req.body.toId;
	res.setHeader('Content-Type', 'application/json');
	res.send({address: await deposit(password, toKey)});
}

exports.scheduledDeposit = async (password, toKey) => {
	await deposit(password, toKey);
}

//internal function
function deposit(password, toKey) {
	return new Promise((resolve, reject) => {
	    web3.eth.personal.unlockAccount(etherbase, password, 3).then(() => {
			return coinInstance.depositAllowance(toKey, {from: etherbase, gas:gasLimit})
		}).then(() => {
	        resolve(toKey)
		});
	});
}

//internal function
function reset(password, toKey) {
	return new Promise((resolve, reject) => {
	    web3.eth.personal.unlockAccount(etherbase, password, 3).then(() => {
			return coinInstance.resetBalances(toKey, {from: etherbase, gas:gasLimit})
		}).then(() => {
	        resolve(toKey)
		});
	});
}

exports.resetBalances = async (req, res, next) => {
	const password = req.body.password;
	const toKey = req.body.toId;
	res.setHeader('Content-Type', 'application/json');
	res.send({address: await reset(password, toKey)});
}

exports.scheduledReset = async (password, toKey) => {
	await reset(password, toKey);
}