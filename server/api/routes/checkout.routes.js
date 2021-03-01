const router = require('express').Router();
const checkoutCtrl = require('~controllers/checkout.controller');
const auth = require('~middleware/auth');
const tools = require('~utils/tools');

module.exports = tools.applyRoutes(router, [
  
  ['POST', '/checkouts', auth('customer').get('groups'), checkoutCtrl.createNewCheckout]

]);
