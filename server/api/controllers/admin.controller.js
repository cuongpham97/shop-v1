const { StatusCodes } = require('http-status-codes');
const adminService  = require('~services/admin.service');

exports.getManyAdmins = async function (req, res) {
  const admins = await adminService.find(req.query);

  return res.status(StatusCodes.OK).json(admins);
}

exports.getAdminById = async function (req, res) {
  const admin = await adminService.findById(req.params.id, req.query.fields);

  return res.status(StatusCodes.OK).json(admin);
}

exports.registerNewAdminAccount = async function (req, res) {
  const newAdmin = await adminService.create(req.body);

  return res.status(StatusCodes.OK).json(newAdmin);
};

exports.partialUpdateAdmin = async function (req, res) {

  const role = req.user.roles.includes('superadmin') ? 'superadmin' : 'admin';
  
  const admin = await adminService.partialUpdate(req.params.id, req.body, role);

  return res.status(StatusCodes.OK).json(admin);
}

exports.changeAdminPassword = async function (req, res) {

  let role = req.user && req.user.type;

  if (role !== 'admin') {
    throw new AuthenticationException('Must be authenticated to do this action');
  }

  role = req.user.roles && req.user.roles.indexOf('superadmin') !== -1
    ? 'superadmin'
    : 'admin';

  await adminService.changePassword(req.params.id, req.body, role);

  return res.status(StatusCodes.NO_CONTENT).end();
}

exports.deleteAdminById = async function (req, res) {
  const result = await adminService.deleteById(req.params.id);

  return res.status(StatusCodes.OK).json(result);
}

exports.deleteManyAdmins = async function (req, res) {
  const result = await adminService.deleteMany(req.query.ids);

  return res.status(StatusCodes.OK).json(result);
}
