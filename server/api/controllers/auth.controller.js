const { StatusCodes } = require('http-status-codes');
const authService = require('~services/auth.service');

exports.getCustomerTokens = async function (req, res) {
  const result = await authService.getTokens(req.headers['authorization'], 'customer');

  return res.status(StatusCodes.OK).json(result);
}

exports.getAdminTokens = async function (req, res) {
  const result = await authService.getTokens(req.headers['authorization'], 'admin');

  return res.status(StatusCodes.OK).json(result);
}

exports.refreshCustomerTokens = async function (req, res) {
  const result = await authService.refreshTokens(req.body, 'customer');

  return res.status(StatusCodes.OK).json(result);
}

exports.refreshAdminTokens = async function (req, res) {
  const result = await authService.refreshTokens(req.body, 'admin');

  return res.status(StatusCodes.OK).json(result);
}
