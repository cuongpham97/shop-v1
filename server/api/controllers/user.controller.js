const { StatusCodes } = require('http-status-codes');
const userService = require('../services/user.service');

exports.getManyUser = async function(req, res, next) {

  let users = await userService.find(req.query);

  return res.status(StatusCodes.OK).json(users);
}

exports.registerNewUserAccount = async function(req, res, next) {
  let newUser = await userService.create(req.body);
  
  return res.status(StatusCodes.OK).json(newUser);
}
