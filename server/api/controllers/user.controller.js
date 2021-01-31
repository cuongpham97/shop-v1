const { StatusCodes } = require('http-status-codes');
const userService  = require('~services/user.service');
const _ = require('lodash');

exports.getUserById = async function (req, res) {
  const user = await userService.findById(req.params.id, req.query.fields);

  return res.status(StatusCodes.OK).json(user);
}

exports.registerNewUserAccount = async function (req, res) {
  const newUser = await userService.create(req.body);
  
  return res.status(StatusCodes.OK).json(newUser);
}

exports.partialUpdateUser = async function (req, res) {
  await userService.partialUpdate(req.params.id, req.body);

  return res.status(StatusCodes.NO_CONTENT).end();
}

exports.changeUserPassword = async function (req, res) {

  let role;

  switch (true) {
    case req.user:
      role = 'self';
      break;
    
    case req.admin:
      role = 'admin';
      break;

    default:
      throw new Error('Must be authenticated to do this action');
  }

  await userService.changePassword(req.params.id, req.body, role);

  return res.status(StatusCodes.NO_CONTENT).end();
}

exports.getManyUser = async function (req, res) {
  const users = await userService.find(req.query);

  return res.status(StatusCodes.OK).json(users);
}

exports.deleteUserById = async function (req, res) {
  await userService.deleteById(req.params.id);

  return res.status(StatusCodes.NO_CONTENT).end();
}

exports.deleteManyUser = async function (req, res) {
  const result = await userService.deleteMany(req.query.ids);

  return res.status(StatusCodes.OK).json(result);
}
