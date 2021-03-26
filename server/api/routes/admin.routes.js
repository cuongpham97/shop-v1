const adminCtrl = require('~controllers/admin.controller');
const auth = require('~middleware/auth');
const tools = require('~utils/tools');
const router = tools.createRouter();

router.get('/admins/:id', auth('admin').ownerId('params.id'), adminCtrl.getAdminById);
router.patch('/admins/:id', auth('admin').ownerId('params.id'), adminCtrl.partialUpdateAdmin);
router.put('/admins/:id/password', auth('admin').ownerId('params.id'), adminCtrl.changeAdminPassword);

router.get('/admin/admins/exists', auth('admin').roles('superadmin'), adminCtrl.checkExistAdmin);
router.get('/admin/admins', auth('admin').roles('superadmin'), adminCtrl.getManyAdmins);
router.get('/admin/admins/:id', auth('admin').roles('superadmin'), adminCtrl.getAdminById);
router.post('/admin/admins', auth('admin').roles('superadmin'), adminCtrl.registerNewAdminAccount);
router.patch('/admin/admins/:id', auth('admin').roles('superadmin'), adminCtrl.partialUpdateAdmin);
router.put('/admin/admins/:id/password', auth('admin').roles('superadmin'), adminCtrl.changeAdminPassword);


router.delete('/admin/admins/:id', auth('admin').roles('superadmin'), adminCtrl.deleteAdminById);
router.delete('/admin/admins', auth('admin').roles('superadmin'), adminCtrl.deleteManyAdmins);

module.exports = router;
