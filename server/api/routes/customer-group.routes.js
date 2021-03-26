const groupCtrl = require('~controllers/customer-group.controller');
const tools = require('~utils/tools');
const auth = require('~middleware/auth');
const router = tools.createRouter();

router.get('/admin/customer-groups/exists', auth('admin').can('customer-group.create'), groupCtrl.checkCustomerGroupExist);

router.get('/admin/customer-groups', auth('admin').can('customer-group.read'), groupCtrl.getManyCustomerGroups);
router.get('/admin/customer-groups/:id', auth('admin').can('customer-group.read'), groupCtrl.getCustomerGroupById);
router.post('/admin/customer-groups', auth('admin').can('customer-group.create'), groupCtrl.createCustomerGroup);
router.patch('/admin/customer-groups/:id', auth('admin').can('customer-group.update'), groupCtrl.partialUpdateCustomerGroup);
router.delete('/admin/customer-groups/:id', auth('admin').can('customer-group.delete'), groupCtrl.deleteCustomerGroupById);
router.delete('/admin/customer-groups', auth('admin').can('customer-group.delete'), groupCtrl.deleteManyCustomerGroups);

module.exports = router;
