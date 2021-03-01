const router = require('express').Router();
const pmsCtrl = require('~controllers/permission.controller');;
const tools = require('~utils/tools');

module.exports = tools.applyRoutes(router, [

  ['GET', '/admin/permission', pmsCtrl.getAllPermission]

]);
