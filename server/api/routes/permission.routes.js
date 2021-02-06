const router = require('express').Router();
const pmsCtrl = require('~controllers/permission.controller');
const guard = require('~middleware/guard');
const tools = require('~utils/tools');

module.exports = tools.applyRoutes(router, [

  ['GET', '/admin/permission', pmsCtrl.getAllPermission]

]);
