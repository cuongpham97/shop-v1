const orderCtrl = require('~controllers/order.controller');
const auth = require('~middleware/auth');
const tools = require('~utils/tools');
const router = tools.createRouter();

router.get('/orders', auth('customer'), orderCtrl.getCustomerOrders);
router.get('/orders/:id', auth('customer'), orderCtrl.getCustomerOrderById);
router.post('/orders', auth('customer'), orderCtrl.createNewOrder);
router.post('/orders/:id/status', auth('customer'), orderCtrl.cancelOrder);

router.get('/admin/orders', auth('admin').can('order.read'), orderCtrl.getManyOrders);
router.get('/admin/orders/:id', auth('admin').can('order.read'), orderCtrl.getOrderById);
router.post('/admin/orders/:id/status', auth('admin').can('order.update'), orderCtrl.createOrderStatus);
router.delete('/admin/orders/:id', auth('admin').can('order.delete'), orderCtrl.deleteOrderById);
router.delete('/admin/orders', auth('admin').can('order.delete'), orderCtrl.deleteManyOrders);

module.exports = router;
