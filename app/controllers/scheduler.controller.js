const schedule 	= require('node-schedule');
const owner = require('./owner.controller.js');

var initDepositScheduler = () => {
	var scheduler = schedule.scheduleJob("* * 1 * *", function() {
	  	owner.scheduledDeposit("root", "0xCe47a8E60615C2d87486E8D1631d71ECE7Df83Fe");
	});
	return scheduler;
}

var initResetScheduler = () => {
	var scheduler = schedule.scheduleJob("* * * */4 * ", function() { //every four months
	  	owner.scheduledReset("root", "0xCe47a8E60615C2d87486E8D1631d71ECE7Df83Fe");
	});
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
