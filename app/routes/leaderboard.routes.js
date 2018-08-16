const router = require('express').Router(),
	  leaderboard   = require('../controllers/leaderboard.controller.js');

router.get('/', leaderboard.getTopTen);

router.post('/reset', leaderboard.resetLeaderboard);


module.exports = router;