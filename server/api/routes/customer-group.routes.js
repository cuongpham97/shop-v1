const router = require('express').Router();
const groupCtrl = require('~controllers/customer-group.controller');
const tools = require('~utils/tools');

module.exports = tools.applyRoutes(router, [

  ['GET', '/admin/customer-groups', groupCtrl.getManyCustomerGroup ],
  ['GET', `/admin/customer-groups/:id`, groupCtrl.getCustomerGroupById],
  ['POST', '/admin/customer-groups', groupCtrl.createCustomerGroup],
  ['PATCH', '/admin/customer-groups/:id', groupCtrl.partialUpdateCustomerGroup],
  ['DELETE', `/admin/customer-groups/:id`, groupCtrl.deleteCustomerGroupById],
  ['DELETE', '/admin/customer-groups', groupCtrl.deleteManyCustomerGroup]

]);
