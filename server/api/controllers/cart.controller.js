const { StatusCodes } = require('http-status-codes');
const cartService  = require('~services/cart.service');

exports.getCurrentUserCart = async function (req, res) {

  const cart = await cartService.findByCustomer(req.user);

  return res.status(StatusCodes.OK).json(cart);
}

exports.setCurrentUserCartItem = async function (req, res) {
  const item = await cartService.setCartItem(req.user._id, req.body);

  return res.status(StatusCodes.NO_CONTENT).end();
}
