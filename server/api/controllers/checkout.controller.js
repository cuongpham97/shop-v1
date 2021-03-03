const { StatusCodes } = require('http-status-codes');
const checkoutService  = require('~services/checkout.service');

exports.getCheckoutByCustomer = async function (req, res) {
  const checkout = await checkoutService.findByCustomer(req.user);

  return res.status(StatusCodes.OK).json(checkout);
}

exports.createNewCheckout = async function (req, res) {
  const checkout = await checkoutService.create(req.user, req.body);
  return res.status(StatusCodes.OK).json(checkout);
}
