const router = require('express').Router();
const roleCtrl = require('~controllers/role.controller');
const tools = require('~utils/tools');

module.exports = tools.applyRoutes(router, [
  ['GET', '/admin/roles', roleCtrl.getManyRole],
  ['POST', '/admin/roles', roleCtrl.createNewRole]
]);
