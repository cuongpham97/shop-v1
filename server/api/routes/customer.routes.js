const router = require('express').Router();
const customerCtrl = require('~controllers/customer.controller');
const tools = require('~utils/tools');

module.exports = tools.applyRoutes(router, [

  ['GET', '/customers/:id', customerCtrl.getCustomerById],
  ['POST', '/customers', customerCtrl.registerNewCustomerAccount],
  ['PATCH', '/customers/:id', customerCtrl.partialUpdateCustomer],
  ['PUT', '/customers/:id/password', customerCtrl.changeCustomerPassword],
  ['DELETE', '/customers/:id', customerCtrl.deleteCustomerById],

  ['GET', '/admin/customers', customerCtrl.getManyCustomer],
  ['GET', '/admin/customers/:id', customerCtrl.getCustomerById],
  ['PATCH', '/admin/customers/:id', customerCtrl.partialUpdateCustomer],
  ['PUT', '/admin/customers/:id/password', customerCtrl.changeCustomerPassword],
  ['DELETE', '/admin/customers/:id', customerCtrl.deleteCustomerById],
  ['DELETE', '/admin/customers', customerCtrl.deleteManyCustomer]
  
]);
