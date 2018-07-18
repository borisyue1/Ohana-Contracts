const router = require('express').Router(),
	  admin   = require('../controllers/admin.controller.js');

router.post('/adminTransferableBalance', admin.getAdminTransferableBalance);

router.post('/adminUserAllowance', admin.getAdminUserAllowance);

router.post('/isAdmin', admin.isAdmin);

router.patch('/transferFrom', admin.transferFrom);

router.patch('/adminBurnFrom', admin.burnFrom);

router.post('/addAdmin', admin.addAdmin);

router.delete('/removeAdmin', admin.removeAdmin);

router.post('/team', admin.getTeam);

router.post('/isTeamMember', admin.isTeamMember);

router.patch('/addTeamMember', admin.addTeamMember);

router.patch('/removeTeamMember', admin.removeTeamMember);


module.exports = router;