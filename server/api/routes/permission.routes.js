const router = require('express').Router();
const permissionCtrl = require('~controllers/permission.controller');
const tools = require('~utils/tools');

module.exports = tools.applyRoutes(router, [
  ['GET', '/admin/permission', permissionCtrl.getAllPermission ]
]);