const authCtrl = require('~controllers/auth.controller');
const tools = require('~utils/tools');
const router = tools.createRouter();

router.get('/auth/token', authCtrl.getCustomerToken);
router.post('/auth/token/refresh', authCtrl.refreshCustomerToken);
  
router.get('/admin/auth/token', authCtrl.getAdminToken);
router.post('/admin/auth/token/refresh', authCtrl.refreshAdminToken);

module.exports = router;
