const router = require('express').Router();
const checkoutCtrl = require('~controllers/checkout.controller');
const auth = require('~middleware/auth');
const tools = require('~utils/tools');

module.exports = tools.applyRoutes(router, [
  
  ['GET', '/checkouts', auth('customer'), checkoutCtrl.getCheckoutByCustomer],
  ['POST', '/checkouts', auth('customer').get('groups'), checkoutCtrl.createNewCheckout]

]);
