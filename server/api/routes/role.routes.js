const roleCtrl = require('~controllers/role.controller');
const auth = require('~middleware/auth');
const tools = require('~utils/tools');
const router = tools.createRouter();

router.get('/admin/roles', roleCtrl.getManyRole);
router.get('/admin/roles/:id', roleCtrl.getRoleById);
router.post('/admin/roles', auth('admin').get('displayName'), roleCtrl.createNewRole);
router.patch('/admin/roles/:id', auth('admin').get('displayName'), roleCtrl.partialUpdateRole);
router.delete('/admin/roles/:id', roleCtrl.deleteRoleById);
router.delete('/admin/roles', roleCtrl.deleteManyRole);

module.exports = router;
