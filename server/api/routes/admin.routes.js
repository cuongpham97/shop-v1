const router = require('express').Router();
const adminCtrl = require('~controllers/admin.controller');
const auth = require('~middleware/auth');
const tools = require('~utils/tools');

module.exports = tools.applyRoutes(router, [

  ['GET', '/admins', adminCtrl.getManyAdmin ],
  ['GET', `/admins/:id`, adminCtrl.getAdminById],
  ['POST', '/admins', adminCtrl.registerNewAdminAccount],
  ['PATCH', '/admins/:id', auth('admin'), adminCtrl.partialUpdateAdmin],
  ['PUT', '/admins/:id/password', adminCtrl.changeAdminPassword],
  ['DELETE', `/admins/:id`, adminCtrl.deleteAdminById],
  ['DELETE', '/admins', adminCtrl.deleteManyAdmin]

]);
