const OhanaCoin   = require('../contracts/OhanaCoin.js');

const truffleConfig = require('../../truffle.js').networks.development;
const url = "http://" + truffleConfig.host + ':' + truffleConfig.port;

const Web3 	= require('web3'),
	  web3 	= new Web3(new Web3.providers.HttpProvider(url));

web3.eth.defaultAccount = '0xba21eac1ae5cafc66e3e5f1e49dea4be6a36c988';
const etherbase = web3.eth.defaultAccount;
const gasLimit = 10000000;

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

exports.depositAllowance = (req, res, next) => {
	const password = req.body.password;
	const toKey = req.body.toId;
	res.setHeader('Content-Type', 'application/json');
	web3.eth.personal.unlockAccount(etherbase, password, 3).then(() => {
		return coinInstance.depositAllowance(toKey, {from: etherbase, gas:gasLimit})
	}).then(() => {
        res.send({ address: toKey });
	});
}

exports.resetBalances = (req, res, next) => {
	const password = req.body.password;
	const toKey = req.body.toId;
	res.setHeader('Content-Type', 'application/json');
	web3.eth.personal.unlockAccount(etherbase, password, 3).then((response) => {
		return coinInstance.resetBalances(toKey, {from: etherbase, gas:gasLimit})
	}).then(() => {
		res.send({ address: toKey });
	});
}