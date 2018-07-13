const router = require('express').Router(),
	  admin   = require('../controllers/admin.controller.js');

router.post('/adminTransferableBalance', admin.getAdminTransferableBalance);

router.post('/adminUserAllowance', admin.getAdminUserAllowance);

router.post('/isAdmin', admin.isAdmin);

router.patch('/transferFrom', admin.transferFrom);

router.patch('/adminBurnFrom', admin.burnFrom);

router.post('/addAdmin', admin.addAdmin);

router.delete('/removeAdmin', admin.removeAdmin);


module.exports = router;