const router = require('express').Router(),
	  scheduler   = require('../controllers/scheduler.controller.js');

router.get("/nextDeposit", scheduler.nextDeposit);

router.get("/nextReset", scheduler.nextReset);


module.exports = router;