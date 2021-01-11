const { StatusCodes } = require('http-status-codes');
const userService = require('../services/user.service');

exports.getManyUser = async function (req, res, next) {
  let users = await userService.find(req.query);

  return res.status(StatusCodes.OK).json(users);
}

exports.registerNewUserAccount = async function (req, res, next) {
  let newUser = await userService.create(req.body);
  
  return res.status(StatusCodes.OK).json(newUser);
}

exports.partialUpdateUser = async function (req, res, next) {
  await userService.partialUpdate(req.params.id, req.body);

  return res.status(StatusCodes.NO_CONTENT).json(null);
}

exports.changeUserPassword = async function (req, res, next) {
  await userService.changePassword(req.params.id, req.body);

  return res.status(StatusCodes.NO_CONTENT).json(null);
}

exports.deleteUserById = async function (req, res, next) {
  await userService.deleteById(req.params.id);

  return res.status(StatusCodes.NO_CONTENT).json(null);
}
