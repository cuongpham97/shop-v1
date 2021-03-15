const { StatusCodes } = require('http-status-codes');
const roleService  = require('~services/role.service');

exports.getManyRoles = async function (req, res) {
  const roles = await roleService.find(req.query);

  return res.status(StatusCodes.OK).json(roles);
}

exports.getRoleById = async function (req, res) {
  const role = await roleService.findById(req.params.id);

  return res.status(StatusCodes.OK).json(role);
}

exports.createNewRole = async function (req, res) {
  const newRole = await roleService.create(req.body, req.user);

  return res.status(StatusCodes.OK).json(newRole);
}

exports.partialUpdateRole = async function (req, res) {
  const role = await roleService.partialUpdate(req.params.id, req.body, req.user);

  return res.status(StatusCodes.OK).json(role);
}

exports.deleteRoleById = async function (req, res) {
  const result = await roleService.deleteById(req.params.id);

  return res.status(StatusCodes.OK).json(result);
}

exports.deleteManyRoles = async function (req, res) {
  const result = await roleService.deleteMany(req.query.ids);

  return res.status(StatusCodes.OK).json(result);
}
