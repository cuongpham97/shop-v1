const router = require('express').Router();
const cartCtrl = require('~controllers/cart.controller');
const guard = require('~middleware/guard');
const tools = require('~utils/tools');

module.exports = tools.applyRoutes(router, [

  ['GET', '/carts', guard.auth('customer').get('group') , cartCtrl.getCurrentUserCart],
  ['POST', '/carts/items', guard.auth('customer'), cartCtrl.setCurrentUserCartItem]
  
]);
