const groupCtrl = require('~controllers/customer-group.controller');
const tools = require('~utils/tools');
const router = tools.createRouter();

router.get('/admin/customer-groups', groupCtrl.getManyCustomerGroup );
router.get('/admin/customer-groups/:id', groupCtrl.getCustomerGroupById);
router.post('/admin/customer-groups', groupCtrl.createCustomerGroup);
router.patch('/admin/customer-groups/:id', groupCtrl.partialUpdateCustomerGroup);
router.delete('/admin/customer-groups/:id', groupCtrl.deleteCustomerGroupById);
router.delete('/admin/customer-groups', groupCtrl.deleteManyCustomerGroup);

module.exports = router;
