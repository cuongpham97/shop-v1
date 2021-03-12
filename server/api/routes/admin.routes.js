const adminCtrl = require('~controllers/admin.controller');
const auth = require('~middleware/auth');
const tools = require('~utils/tools');
const router = tools.createRouter();

router.get('/admins', auth('admin').roles('superadmin'), adminCtrl.getManyAdmins);
router.get('/admins/:id', auth('admin'), adminCtrl.getAdminById);
router.post('/admins', auth('admin').roles('superadmin'), adminCtrl.registerNewAdminAccount);
router.patch('/admins/:id', auth('admin'), adminCtrl.partialUpdateAdmin);
router.put('/admins/:id/password', auth('admin'), adminCtrl.changeAdminPassword);
router.delete('/admins/:id', auth('admin').roles('superadmin'), adminCtrl.deleteAdminById);
router.delete('/admins', auth('admin').roles('superadmin'), adminCtrl.deleteManyAdmins);

module.exports = router;
