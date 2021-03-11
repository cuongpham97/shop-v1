const customerCtrl = require('~controllers/customer.controller');
const tools = require('~utils/tools');
const router = tools.createRouter();

router.get('/customers/:id', customerCtrl.getCustomerById);
router.post('/customers', customerCtrl.registerNewCustomerAccount);
router.patch('/customers/:id', customerCtrl.partialUpdateCustomer);
router.put('/customers/:id/password', customerCtrl.changeCustomerPassword);
router.delete('/customers/:id', customerCtrl.deleteCustomerById);

router.get('/admin/customers', customerCtrl.getManyCustomer);
router.get('/admin/customers/:id', customerCtrl.getCustomerById);
router.patch('/admin/customers/:id', customerCtrl.partialUpdateCustomer);
router.put('/admin/customers/:id/password', customerCtrl.changeCustomerPassword);
router.delete('/admin/customers/:id', customerCtrl.deleteCustomerById);
router.delete('/admin/customers', customerCtrl.deleteManyCustomer);

module.exports = router;
