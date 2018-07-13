const router = require('express').Router(),
	  leaderboard   = require('../controllers/leaderboard.controller.js');

router.get('/', leaderboard.getTopTen);

router.patch('/reset', leaderboard.resetLeaderboard);


module.exports = router;