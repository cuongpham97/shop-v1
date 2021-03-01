const router = require('express').Router();
const cartCtrl = require('~controllers/cart.controller');
const auth = require('~middleware/auth');
const tools = require('~utils/tools');

module.exports = tools.applyRoutes(router, [

  ['GET', '/carts', auth('customer').get('groups') , cartCtrl.getCurrentUserCart],
  ['POST', '/carts/items', auth('customer'), cartCtrl.setCurrentUserCartItem]
  
]);
