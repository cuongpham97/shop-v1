const pmsCtrl = require('~controllers/permission.controller');;
const tools = require('~utils/tools');
const router = tools.createRouter();

router.get('/admin/permission', pmsCtrl.getAllPermission);

module.exports = router;
