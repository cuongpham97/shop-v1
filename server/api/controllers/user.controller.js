const { StatusCodes } = require('http-status-codes');
const userService  = require('../services/user.service');
const _ = require('lodash');

exports.getUserById = async function (req, res, next) {
  const user = await userService.findById(req.params.id);

  return res.status(StatusCodes.OK).json(user);
}

exports.registerNewUserAccount = async function (req, res, next) {
  const newUser = await userService.create(req.body);
  
  return res.status(StatusCodes.OK).json(newUser);
}

exports.partialUpdateUser = async function (req, res, next) {
  await userService.partialUpdate(req.params.id, req.body);

  return res.status(StatusCodes.NO_CONTENT).json(null);
}

exports.changeUserPassword = async function (req, res, next) {
  const role = _.isEmpty(req.admin) ? 'user' : 'admin';
  await userService.changePassword(req.params.id, req.body, role);

  return res.status(StatusCodes.NO_CONTENT).json(null);
}

exports.getManyUser = async function (req, res, next) {
  const users = await userService.find(req.query);

  return res.status(StatusCodes.OK).json(users);
}

exports.deleteUserById = async function (req, res, next) {
  await userService.deleteById(req.params.id);

  return res.status(StatusCodes.NO_CONTENT).json(null);
}

exports.deleteManyUser = function (req, res, next) {
  const result = await userService.deleteMany(req.query.ids);

  return res.status(StatusCodes.OK).json(result);
}
