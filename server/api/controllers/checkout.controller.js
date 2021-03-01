const { StatusCodes } = require('http-status-codes');
const checkoutService  = require('~services/checkout.service');

exports.createNewCheckout = async function (req, res) {
  const checkout = await checkoutService.create(req.user, req.body);
  return res.status(StatusCodes.OK).json(checkout);
}
