const router = require('express').Router(),
	  user   = require('../controllers/user.controller.js');

router.get('/count', user.getNumUsers);

router.post('/balances', user.getBalances);

router.patch('/transfer', user.transferTo);

router.post("/register", user.registerUser);

router.post("/logs", user.getLogs);

module.exports = router;