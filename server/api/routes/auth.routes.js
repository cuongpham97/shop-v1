const router = require('express').Router();
const authCtrl = require('~controllers/auth.controller');
const tools = require('~utils/tools');

module.exports = tools.applyRoutes(router, [

  ['GET', '/auth/token', authCtrl.getUserToken],
  ['GET', '/admin/auth/token', authCtrl.getAdminToken]
  
]);
