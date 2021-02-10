const { StatusCodes } = require('http-status-codes');
const authService = require('~services/auth.service');

exports.getCustomerToken = async function (req, res) {
  const result = await authService.getToken(req.headers['authorization'], 'customer');

  return res.status(StatusCodes.OK).json(result);
}

exports.getAdminToken = async function (req, res) {
  const result = await authService.getToken(req.headers['authorization'], 'admin');

  return res.status(StatusCodes.OK).json(result);
}

exports.refreshCustomerToken = async function (req, res) {
  const result = await authService.refreshToken(req.body, 'customer');

  return res.status(StatusCodes.OK).json(result);
}

exports.refreshAdminToken = async function (req, res) {
  const result = await authService.refreshToken(req.body, 'admin');

  return res.status(StatusCodes.OK).json(result);
}
