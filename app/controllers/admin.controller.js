const Admin 	= require('../contracts/Admin.js'),
	  OhanaCoin = require('../contracts/OhanaCoin.js'),
	  Leaderboard = require('../contracts/Leaderboard.js');

const config = require('../../config/config.js'),
	  web3 = config.web3.instance,
	  etherbase = web3.eth.defaultAccount,
 	  gasLimit = config.gasLimit;
 	  
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

// READ VALUES
exports.getTransferableBalance = (req, res, next) => {
	const publicKey = req.body.adminId;
	adminInstance.getAdminTransferableBalance(publicKey)
	.then((result) => {
	    res.setHeader('Content-Type', 'application/json');
        res.send({ balance: result.toNumber() });
	}, (error) => {
	    res.send({ error: error.message});
	}); 
}

exports.getBurnBalance = (req, res, next) => {
	const adminKey = req.body.adminId;
	const userKey = req.body.userId;
	adminInstance.getAdminBurnBalance(adminKey, userKey)
	.then((result) => {
	    res.setHeader('Content-Type', 'application/json');
        res.send({ balance: result.toNumber() });
	}, (error) => {
	    res.send({ error: error.message});
	}); 
}

exports.getUserAllowance = (req, res, next) => {
	const adminKey = req.body.adminId;
	const userKey = req.body.userId;
	adminInstance.getAdminUserAllowance(adminKey, userKey)
	.then((result) => {
	    res.setHeader('Content-Type', 'application/json');
        res.send({ balance: result.toNumber() });
	}, (error) => {
	    res.send({ error: error.message});
	}); 
}

exports.getUserTransferLimit = (req, res, next) => {
	adminInstance.getAdminUserTransferLimit()
	.then((result) => {
	    res.setHeader('Content-Type', 'application/json');
        res.send({ balance: result.toNumber() });
	}, (error) => {
	    res.send({ error: error.message});
	}); 
}

exports.getTotalTransferLimit = (req, res, next) => {
	adminInstance.getAdminTotalTransferLimit()
	.then((result) => {
	    res.setHeader('Content-Type', 'application/json');
        res.send({ balance: result.toNumber() });
	}, (error) => {
	    res.send({ error: error.message});
	}); 
}

exports.getTotalBurnLimit = (req, res, next) => {
	adminInstance.getAdminTotalBurnLimit()
	.then((result) => {
	    res.setHeader('Content-Type', 'application/json');
        res.send({ balance: result.toNumber() });
	}, (error) => {
	    res.send({ error: error.message});
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


// EDIT VALUES
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

exports.addAdmin = (req, res, next) => {
	const publicKey = req.body.adminId;
	const password = req.body.password;
	const team = req.body.team;
	res.setHeader('Content-Type', 'application/json');
	web3.eth.personal.unlockAccount(etherbase, password, 10).then(() => {
		return adminInstance.addAdmin(publicKey, [team], {from: etherbase, gas: gasLimit})
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
		return adminInstance.removeAdmin(publicKey, {from: etherbase, gas: gasLimit})
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


exports.addTeamMember = (req, res, next) => {
	const adminKey = req.body.adminId;
	const userKey = req.body.userId;
	const password = req.body.password;
	res.setHeader('Content-Type', 'application/json');
	web3.eth.personal.unlockAccount(adminKey, password, 10).then(() => {
		return adminInstance.addTeamMember(userKey, {from: adminKey, gas: gasLimit})
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
		return adminInstance.removeTeamMember(userKey, {from: adminKey, gas: gasLimit})
	}).then((result) => {
		res.send({ removeTeamMember: result });
	}).catch((error) => {
		res.send({error: error.message});
	});
}