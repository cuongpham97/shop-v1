const { StatusCodes } = require('http-status-codes');
const authService = require('~services/auth.service');

exports.getUserToken = async function (req, res) {

  const result = await authService.getToken(req.headers['authorization'], 'user');

  return res.status(StatusCodes.OK).json(result);
}

exports.getAdminToken = async function (req, res) {
  
  const result = await authService.getToken(req.headers['authorization'], 'admin');

  return res.status(StatusCodes.OK).json(result);
}