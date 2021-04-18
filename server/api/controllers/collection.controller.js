const { StatusCodes } = require('http-status-codes');
const cltService  = require('~services/collection.service');

exports.getProductById = async function (req, res) {
  const product = await cltService.findProductById(req.params.id, req.query, req.user);

  return res.status(StatusCodes.OK).json(product);
}

exports.getAllProducts = async function (req, res) {
  const products = await cltService.findAllProducts(req.query, req.user);

  return res.status(StatusCodes.OK).json(products);
}

exports.getNewArrival = async function (req, res) {
  const products = await cltService.findNewestProducts(req.query, req.user);

  return res.status(StatusCodes.OK).json(products);
}
