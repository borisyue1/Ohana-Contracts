const Admin 	= require('../contracts/Admin.js'),
	  OhanaCoin = require('../contracts/OhanaCoin.js'),
	  Leaderboard = require('../contracts/Leaderboard.js');

const truffleConfig = require('../../truffle.js').networks.development;
const url = "http://" + truffleConfig.host + ':' + truffleConfig.port;

const Web3 	= require('web3'),
	  web3 	= new Web3(new Web3.providers.HttpProvider(url));

web3.eth.defaultAccount = '0x527f2e7a22a3038CA8503CE411C168D53bf1f553';
const etherbase = web3.eth.defaultAccount;
const gasLimit = 10000000;
var coinInstance, adminInstance; 

OhanaCoin.deployed().then((instance) => {
	coinInstance = instance;
});

Admin.deployed().then((instance) => {
	adminInstance = instance;
});

Leaderboard.deployed().then((instance) => {
	leaderboardInstance = instance;
});

exports.getAdminTransferableBalance = (req, res, next) => {
	const publicKey = req.body.adminId;
	adminInstance.getAdminTransferableBalance(publicKey)
	.then((result) => {
	    res.setHeader('Content-Type', 'application/json');
        res.send({ balance: result.toNumber() });
	}, (error) => {
	    res.send({ error: error.message});
	}); 
}

exports.getAdminUserAllowance = (req, res, next) => {
	const adminKey = req.body.adminId;
	const userKey = req.body.userId;
	adminInstance.getAdminUserAllowance(adminKey, userKey)
	.then((result) => {
	    res.setHeader('Content-Type', 'application/json');
        res.send({ balance: result.toNumber() });
	}, (error) => {
	    res.send({ errorrr: error.message});
	}); 
}

exports.transferFrom = (req, res, next) => {
	const fromKey = req.body.adminId;
	const toKey = req.body.toId;
	const value = req.body.value;
	const password = req.body.password;
	const message = req.body.message;
	res.setHeader('Content-Type', 'application/json');
	web3.eth.personal.unlockAccount(fromKey, password, 5).then((response) => {
		return coinInstance.transferFrom(toKey, value, message, {from: fromKey, gas: gasLimit})
	}).then((result) => {
		return coinInstance.getPersonalBalance(toKey, {gas: gasLimit})
	}).then((balance) => {
		return leaderboardInstance.addBalance(toKey, balance, {from: fromKey, gas:gasLimit});
	}).then(() => {
		res.send({ result: "submitted to leaderboard!" });
	});
}

exports.burnFrom = (req, res, next) => {
	const fromKey = req.body.adminId;
	const toKey = req.body.toId;
	const value = req.body.value;
	const password = req.body.password;
	res.setHeader('Content-Type', 'application/json');
	web3.eth.personal.unlockAccount(fromKey, password, 5).then((response) => {
		return coinInstance.adminBurnFrom(toKey, value, {from: fromKey, gas: gasLimit});
	}).then((result) => {
		return coinInstance.getPersonalBalance(toKey, {gas: gasLimit});
	}).then((balance) => {
		res.send({ balance: balance });
	});
}

exports.isAdmin = (req, res, next) => {
	const publicKey = req.body.adminId;
	res.setHeader('Content-Type', 'application/json');
	adminInstance.isAdmin(publicKey, {gas: gasLimit})
	.then((result) => {
		res.send({ isAdmin: result });
	}, (error) => {
		res.send({error: error.message});
	});
}

exports.addAdmin = (req, res, next) => {
	const publicKey = req.body.adminId;
	const password = req.body.password;
	const team = req.body.team;
	res.setHeader('Content-Type', 'application/json');
	web3.eth.personal.unlockAccount(etherbase, password, 10).then(() => {
		return adminInstance.addAdmin(publicKey, [team], {from: etherbase, gasLimit: gasLimit})
	}).then((result) => {
		res.send({ addAdmin: result });
	}).catch((error) => {
		res.send({error: error.message});
	});
}

exports.removeAdmin = (req, res, next) => {
	const publicKey = req.body.adminId;
	const password = req.body.password;
	res.setHeader('Content-Type', 'application/json');
	web3.eth.personal.unlockAccount(etherbase, password, 10).then(() => {
		return adminInstance.removeAdmin(publicKey, {from: etherbase, gasLimit: gasLimit})
	}).then((result) => {
		res.send({ removeAdmin: result });
	});
}

exports.getTeam = (req, res, next) => {
	const adminKey = req.body.adminId;
	res.setHeader('Content-Type', 'application/json');
	adminInstance.getTeamMembers(adminKey, {gas: gasLimit})
	.then((result) => {
		res.send({team: result});
	}, (error) => {
		res.send({error: error.message});
	});
}

exports.isTeamMember = (req, res, next) => {
	const adminKey = req.body.adminId;
	const userKey = req.body.userId;
	res.setHeader('Content-Type', 'application/json');
	adminInstance.isTeamMember(adminKey, userKey, {gas: gasLimit})
	.then((result) => {
		res.send({isTeamMember: result});
	}, (error) => {
		res.send({error: error.message});
	});
}

exports.addTeamMember = (req, res, next) => {
	const adminKey = req.body.adminId;
	const userKey = req.body.userId;
	const password = req.body.password;
	res.setHeader('Content-Type', 'application/json');
	web3.eth.personal.unlockAccount(adminKey, password, 10).then(() => {
		return adminInstance.addTeamMember(userKey, {from: adminKey, gasLimit: gasLimit})
	}).then((result) => {
		res.send({ addTeamMember: result });
	}).catch((error) => {
		res.send({error: error.message});
	});
}

exports.removeTeamMember = (req, res, next) => {
	const adminKey = req.body.adminId;
	const userKey = req.body.userId;
	const password = req.body.password;
	res.setHeader('Content-Type', 'application/json');
	web3.eth.personal.unlockAccount(adminKey, password, 10).then(() => {
		return adminInstance.removeTeamMember(userKey, {from: adminKey, gasLimit: gasLimit})
	}).then((result) => {
		res.send({ removeTeamMember: result });
	}).catch((error) => {
		res.send({error: error.message});
	});
}