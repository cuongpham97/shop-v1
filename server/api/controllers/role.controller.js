const { StatusCodes } = require('http-status-codes');
const roleService  = require('~services/role.service');

exports.getManyRole = async function (req, res) {
  const roles = await roleService.find(req.query);

  return res.status(StatusCodes.OK).json(roles);
}

exports.getRoleById = async function (req, res) {

  const role = await roleService.findById(req.params.id);

  return res.status(StatusCodes.OK).json(role);
}

exports.createNewRole = async function (req, res) {
  const newRole = await roleService.create(req.body);

  return res.status(StatusCodes.OK).json(newRole);
}
