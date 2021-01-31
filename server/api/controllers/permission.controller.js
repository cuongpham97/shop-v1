const { StatusCodes } = require('http-status-codes');
const permissionService  = require('~services/permission.service');

exports.getAllPermission = function (_req, res) {
  const permission = permissionService.getAllPermission();

  return res.status(StatusCodes.OK).json({ permission: permission });  
}
