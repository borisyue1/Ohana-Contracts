const router = require('express').Router(),
	  owner  = require('../controllers/owner.controller.js');

router.patch('/burnFrom', owner.burnFrom);

router.patch('/depositAllowance', owner.depositAllowance);

router.patch('/resetBalances', owner.resetBalances);



module.exports = router;