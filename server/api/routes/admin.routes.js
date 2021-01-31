const router = require('express').Router();
const { regexes } = require('~utils/constants');
const adminCtrl = require('~controllers/admin.controller');
const tools = require('~utils/tools');

module.exports = tools.applyRoutes(router, [

  ['GET', '/admin', adminCtrl.getManyAdmin ],
  ['GET', `/admin/:id(${regexes.MONGO_ID})`, adminCtrl.getAdminById],
  ['POST', '/admin', adminCtrl.registerNewAdminAccount],
  ['PATCH', '/admin', adminCtrl.partialUpdateAdmin],
  ['PUT', '/admin/password', adminCtrl.changeAdminPassword],
  ['DELETE', `/admin/:id(${regexes.MONGO_ID})`, adminCtrl.deleteAdminById],
  ['DELETE', '/admin', adminCtrl.deleteManyAdmin]

]);
