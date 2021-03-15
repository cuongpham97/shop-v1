const roleCtrl = require('~controllers/role.controller');
const auth = require('~middleware/auth');
const tools = require('~utils/tools');
const router = tools.createRouter();

router.get('/admin/roles', auth('admin').can('role.read'), roleCtrl.getManyRoles);
router.get('/admin/roles/:id', auth('admin').can('role.read'), roleCtrl.getRoleById);
router.post('/admin/roles', auth('admin').can('role.create').get('displayName'), roleCtrl.createNewRole);
router.patch('/admin/roles/:id', auth('admin').can('role.update').get('displayName'), roleCtrl.partialUpdateRole);
router.delete('/admin/roles/:id', auth('admin').can('role.delete'), roleCtrl.deleteRoleById);
router.delete('/admin/roles', auth('admin').can('role.delete'), roleCtrl.deleteManyRoles);

module.exports = router;
