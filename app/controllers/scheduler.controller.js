const schedule 	= require('node-schedule'),
 	  owner = require('./owner.controller.js'),
 	  config = require('../../config/config.js');

const web3 = config.web3.instance,
	  etherbase = web3.eth.defaultAccount,
 	  gasLimit = config.gasLimit;

var accounts = web3.eth.getAccounts().then((accounts) => {
	return accounts;
});

// MONTH STARTS AT 0
var initDepositScheduler = () => {
	//MINT TOKENS
	let scheduler = schedule.scheduleJob("* * 1 * *", () => {
		accounts.then((result) => {
			result.forEach((account) => {
				if (account != etherbase)
					owner.scheduledDeposit("root", account);
			});
		});
	});
	return scheduler;
}

var initResetScheduler = () => {
	let scheduler = schedule.scheduleJob("* * * */4 *", () => { //every four months
	  	accounts.then((result) => {
			result.forEach((account) => {
				if (account != etherbase)
					owner.scheduledReset("root", account);
			});
		});
	})
	return scheduler;
}

// Stores the previous week of balances for users, gets called at 12 AM everyday to update balances
var initBalanceTrackScheduler = () => {
	let scheduler = schedule.scheduleJob("0 0 12 * 1-7", () => { //every four months
	  	accounts.then((result) => {
			result.forEach((account) => {
				if (account != etherbase)
					owner.storeBalance("root", account);
			});
		});
	})
	return scheduler;
}

// Returns difference between two dates in days and hours
var getTimeDifference = (firstDate, secondDate) => {
	let currentDate = new Date(firstDate),
	 	nextInvocation = new Date(secondDate),
		timeDiff = Math.abs(nextInvocation.getTime() - currentDate.getTime()),
		dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24)),
		hourDiff = Math.floor((timeDiff / (1000 * 3600) - (24 * dayDiff)));
	return [dayDiff, hourDiff];
}

var depositScheduler = initDepositScheduler();
var resetScheduler = initResetScheduler();
var balanceTrackerScheduler = initBalanceTrackScheduler();

exports.nextDeposit = (req, res, next) => {
	let nextDate = new Date(depositScheduler.nextInvocation()),
		mmddyy = (nextDate.getMonth() + 1) + "/" + nextDate.getDate() + "/" + nextDate.getFullYear();
	let timeDiff = getTimeDifference(nextDate, Date.now());
	res.setHeader('Content-Type', 'application/json');
	res.send({Days: + timeDiff[0], Hours: + timeDiff[1], "Next Deposit": mmddyy});
}

exports.nextReset = (req, res, next) => {
	let nextDate = new Date(resetScheduler.nextInvocation()),
		mmddyy = (nextDate.getMonth() + 1) + "/" + nextDate.getDate() + "/" + nextDate.getFullYear();
	let timeDiff = getTimeDifference(nextDate, Date.now());
	res.setHeader('Content-Type', 'application/json');
	res.send({Days: + timeDiff[0], Hours: + timeDiff[1], "Next Reset": mmddyy});
}

exports.setDepositDate = (req, res, next) => {
	const year = req.body.year,
	 	  month = req.body.month,
	 	  day = req.body.day,
	 	  newDate = new Date(year, month - 1, day);
	depositScheduler.reschedule(newDate);
	res.setHeader('Content-Type', 'application/json');
	res.send({date: newDate});
}

exports.setResetDate = (req, res, next) => {
	const year = req.body.year,
	 	  month = req.body.month,
	 	  day = req.body.day,
	 	  newDate = new Date(year, month - 1, day);
	resetScheduler.reschedule(newDate);
	res.setHeader('Content-Type', 'application/json');
	res.send({date: newDate});
}
