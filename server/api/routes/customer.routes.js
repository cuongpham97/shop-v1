const cusCtrl = require('~controllers/customer.controller');
const auth = require('~middleware/auth');
const tools = require('~utils/tools');
const router = tools.createRouter();

router.get('/customers/exists', cusCtrl.checkExistCustomer);

router.get('/customers/:id', auth('customer').ownerId('params.id'), cusCtrl.getCustomerById);
router.post('/customers', cusCtrl.registerNewCustomerAccount);
router.patch('/customers/:id', auth('customer').ownerId('params.id'), cusCtrl.partialUpdateCustomer);
router.put('/customers/:id/password', auth('customer').ownerId('params.id'), cusCtrl.changeCustomerPassword);
router.delete('/customers/:id', auth('customer').ownerId('params.id'), cusCtrl.deleteCustomerById);

router.get('/admin/customers', auth('admin').can('customer.read'), cusCtrl.getManyCustomers);
router.get('/admin/customers/:id',auth('admin').can('customer.read'), cusCtrl.getCustomerById);
router.patch('/admin/customers/:id', auth('admin').can('custome.update'), cusCtrl.partialUpdateCustomer);
router.put('/admin/customers/:id/password', auth('admin').can('customer.update'), cusCtrl.changeCustomerPassword);
router.delete('/admin/customers/:id', auth('admin').can('customer.delete'), cusCtrl.deleteCustomerById);
router.delete('/admin/customers', auth('admin').can('customer.delete'), cusCtrl.deleteManyCustomers);

module.exports = router;
