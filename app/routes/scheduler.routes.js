const router = require('express').Router(),
	  scheduler   = require('../controllers/scheduler.controller.js');

router.get("/nextDeposit", scheduler.nextDeposit);

router.get("/nextReset", scheduler.nextReset);

router.post("/setDepositDate", scheduler.setDepositDate);

router.post("/setResetDate", scheduler.setResetDate);

module.exports = router;