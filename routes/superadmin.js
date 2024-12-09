var express = require('express');
var router = express.Router();
const {adminList,addUpdateAdmin,superAdminDashboard} = require('../controllers/superadminController')
const {authMiddleware} = require('../middleware/authUser')

/* GET home page. */
router.get('/alladmins', authMiddleware,adminList);
router.post('/admin', authMiddleware,addUpdateAdmin);
router.post('/dashboard',superAdminDashboard);




module.exports = router;
