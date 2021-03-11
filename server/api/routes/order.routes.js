const orderCtrl = require('~controllers/order.controller');
const auth = require('~middleware/auth');
const tools = require('~utils/tools');
const router = tools.createRouter();

router.post('/orders', auth('customer'), orderCtrl.createNewOrder);
router.get('/admin/orders', auth('admin'), orderCtrl.getManyOrder);
router.get('/admin/orders/:id', orderCtrl.getOrderById);
router.post('/admin/orders/:id/status', auth('admin'), orderCtrl.createOrderStatus);
router.delete('/admin/orders/:id', orderCtrl.deleteOrderById);
router.delete('/admin/orders', orderCtrl.deleteManyOrder);

module.exports = router;
