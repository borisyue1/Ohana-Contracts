const router = require('express').Router(),
	  user   = require('../controllers/user.controller.js');

// READ VALUES
router.get('/count', user.getNumUsers);

router.post('/balances', user.getBalances);

router.post("/logs", user.getLogs);

router.post("/transferredUsers", user.getTransferredUsers);

router.post("/userTransferredAmount", user.getUserTransferredAmount);



// EDIT VALUES
router.patch('/transfer', user.transferTo);

router.post("/register", user.registerUser);


module.exports = router;