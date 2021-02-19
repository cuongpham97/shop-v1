const router = require('express').Router();
const productCtrl = require('~controllers/product.controller');
const tools = require('~utils/tools');

module.exports = tools.applyRoutes(router, [

  ['GET', '/admin/products', productCtrl.getManyProduct],
  ['POST', '/admin/products', productCtrl.createNewProduct],
  ['PATCH', '/admin/products/:id', productCtrl.partialUpdateProduct],
  ['DELETE', '/admin/products/:id', productCtrl.deleteProductById],
  ['DELETE', '/admin/products', productCtrl.deleteManyProduct]

]);
