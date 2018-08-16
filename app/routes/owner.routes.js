const router = require('express').Router(),
	  owner  = require('../controllers/owner.controller.js');

router.post('/burnFrom', owner.burnFrom);

router.post('/depositAllowance', owner.depositAllowance);

router.post('/resetBalances', owner.resetBalances);



module.exports = router;