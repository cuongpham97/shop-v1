const pmsCtrl = require('~controllers/permission.controller');
const auth = require('~middleware/auth');
const tools = require('~utils/tools');
const router = tools.createRouter();

router.get('/admin/permission', auth('admin').roles('superadmin'), pmsCtrl.getAllPermission);

module.exports = router;
