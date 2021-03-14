const authCtrl = require('~controllers/auth.controller');
const tools = require('~utils/tools');
const router = tools.createRouter();

router.get('/auth/token', authCtrl.getCustomerTokens);
router.post('/auth/token/refresh', authCtrl.refreshCustomerTokens);
  
router.get('/admin/auth/token', authCtrl.getAdminTokens);
router.post('/admin/auth/token/refresh', authCtrl.refreshAdminTokens);

module.exports = router;
