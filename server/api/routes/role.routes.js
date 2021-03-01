const router = require('express').Router();
const roleCtrl = require('~controllers/role.controller');
const auth = require('~middleware/auth');
const tools = require('~utils/tools');

module.exports = tools.applyRoutes(router, [
  
  ['GET', '/admin/roles', roleCtrl.getManyRole],
  ['GET', '/admin/roles/:id', roleCtrl.getRoleById],
  ['POST', '/admin/roles', auth('admin').get('displayName'), roleCtrl.createNewRole],
  ['PATCH', '/admin/roles/:id', auth('admin').get('displayName'), roleCtrl.partialUpdateRole],
  ['DELETE', '/admin/roles/:id', roleCtrl.deleteRoleById],
  ['DELETE', '/admin/roles', roleCtrl.deleteManyRole]

]);
