const { StatusCodes } = require('http-status-codes');
const productService  = require('~services/product.service');

exports.getManyProduct = async function (req, res) {
  const products = await productService.find(req.query);

  return res.status(StatusCodes.OK).json(products);
}

exports.createNewProduct = async function (req, res) {
  const newProduct = await productService.create(req.body);

  return res.status(StatusCodes.OK).json(newProduct);
}
