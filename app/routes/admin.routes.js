const router = require('express').Router(),
	  admin   = require('../controllers/admin.controller.js');

// Read values
router.get('/userTransferLimit', admin.getUserTransferLimit);

router.get('/totalTransferLimit', admin.getTotalTransferLimit);

router.get('/totalBurnLimit', admin.getTotalBurnLimit);

router.post('/transferableBalance', admin.getTransferableBalance);

router.post('/userAllowance', admin.getUserAllowance);

router.post('/burnBalance', admin.getBurnBalance);

router.post('/isAdmin', admin.isAdmin);

router.post('/team', admin.getTeam);

router.post('/isTeamMember', admin.isTeamMember);


// Edit values
router.patch('/transferFrom', admin.transferFrom);

router.patch('/burnFrom', admin.burnFrom);

router.post('/addAdmin', admin.addAdmin);

router.delete('/removeAdmin', admin.removeAdmin);

router.patch('/addTeamMember', admin.addTeamMember);

router.patch('/removeTeamMember', admin.removeTeamMember);


module.exports = router;