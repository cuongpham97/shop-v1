const { StatusCodes } = require('http-status-codes');
const productService  = require('~services/product.service');

exports.getProductById = async function (req, res) {
  const product = await productService.findById(req.params.id);

  return res.status(StatusCodes.OK).json(product);
}

exports.getManyProducts = async function (req, res) {
  const products = await productService.find(req.query);

  return res.status(StatusCodes.OK).json(products);
}

exports.createNewProduct = async function (req, res) {
  const newProduct = await productService.create(req.body);

  return res.status(StatusCodes.OK).json(newProduct);
}

exports.partialUpdateProduct = async function (req, res) {
  const product = await productService.partialUpdate(req.params.id, req.body);

  return res.status(StatusCodes.OK).json(product);
}

exports.deleteProductById = async function (req, res) {
  const result = await productService.deleteById(req.params.id);

  return res.status(StatusCodes.OK).json(result);
}

exports.deleteManyProducts = async function (req, res) {
  const result = await productService.deleteMany(req.query.ids);

  return res.status(StatusCodes.OK).json(result);
}
