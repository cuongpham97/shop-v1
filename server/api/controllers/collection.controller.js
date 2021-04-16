const { StatusCodes } = require('http-status-codes');
const cltService  = require('~services/collection.service');

exports.getAllProducts = async function (req, res) {
  const products = await cltService.findAllProducts(req.query);

  return res.status(StatusCodes.OK).json(products);
}

exports.getNewArrival = async function (req, res) {
  const products = await cltService.findNewestProducts(req.query);

  return res.status(StatusCodes.OK).json(products);
}
