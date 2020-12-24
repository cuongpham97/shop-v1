const { StatusCodes } = require('http-status-codes');
const userService = require('../services/user.service');

exports.registerNewUserAccount = async function(req, res, next) {

  let newUser = await userService.createUser(req.body);
  
  return res.status(StatusCodes.OK).json(newUser);
}
