const router = require('express').Router();
const categoryCtrl = require('~controllers/category.controller');
const tools = require('~utils/tools');

module.exports = tools.applyRoutes(router, [

  ['GET', '/categories/tree', categoryCtrl.getCategoryTree],

  ['GET', '/admin/categories', categoryCtrl.getManyCategory],
  ['POST', '/admin/categories', categoryCtrl.createNewCategory],
  ['PATCH', '/admin/categories/:id', categoryCtrl.partialUpdateCategory],
  ['DELETE', '/admin/categories/:id', categoryCtrl.deleteCategoryById],
  ['DELETE', '/admin/categories', categoryCtrl.deleteManyCategory]
  
]);
