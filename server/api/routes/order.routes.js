const router = require('express').Router();
const orderCtrl = require('~controllers/order.controller');
const auth = require('~middleware/auth');
const tools = require('~utils/tools');

module.exports = tools.applyRoutes(router, [
  
  ['POST', '/orders', auth('customer'), orderCtrl.createNewOrder],

  ['GET', '/admin/orders', auth('admin') , orderCtrl.getManyOrder],
  ['GET', '/admin/orders/:id', orderCtrl.getOrderById],
  ['POST', '/admin/orders/:id/status', auth('admin'), orderCtrl.createOrderStatus],
  ['DELETE', '/admin/orders/:id', orderCtrl.deleteOrderById],
  ['DELETE', '/admin/orders', orderCtrl.deleteManyOrder]

]);
