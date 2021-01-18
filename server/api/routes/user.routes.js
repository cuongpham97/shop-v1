const router = require('express').Router();
const userCtrl = require('~controllers/user.controller');
const tools = require('~utils/tools');

module.exports = tools.applyRoutes(router, [

  ['GET', '/users/:id', userCtrl.getUserById],
  ['POST', '/users', userCtrl.registerNewUserAccount],
  ['PATCH', '/users/:id', userCtrl.partialUpdateUser],
  ['PUT', '/users/:id/password', userCtrl.changeUserPassword],
  ['DELETE', '/users/:id', userCtrl.deleteUserById],

  ['GET', '/admin/users', userCtrl.getManyUser],
  ['GET', '/admin/users/:id', userCtrl.getUserById],
  ['PATCH', '/admin/users/:id', userCtrl.partialUpdateUser],
  ['PUT', '/admin/users/:id/password', userCtrl.changeUserPassword],
  ['DELETE', '/admin/users/:id', userCtrl.deleteUserById],
  ['DELETE', '/admin/users', userCtrl.deleteManyUser]
  
]);
