const { StatusCodes } = require('http-status-codes');
const categoryService = require('~services/category.service');

exports.getCategoriesTree = async function (_req, res) {
  const categoriesTree = await categoryService.getCategoriesTreeFromCache();

  return res.status(StatusCodes.OK).json({ categories: categoriesTree });
}

exports.getManyCategory = async function (req, res) {
  const categories = await categoryService.find(req.query);

  return res.status(StatusCodes.OK).json(categories);
}

exports.createNewCategory = async function (req, res) {
  const category = await categoryService.create(req.body);

  return res.status(StatusCodes.OK).json(category);
}

exports.partialUpdateCategory = async function (req, res) {
  const category = await categoryService.partialUpdate(req.params.id, req.body);

  return res.status(StatusCodes.OK).json(category);
}

exports.deleteCategoryById = async function (req, res) {
  const result = await categoryService.deleteById(req.params.id);

  return res.status(StatusCodes.OK).json(result);
}

exports.deleteManyCategory = async function (req, res) {
  const result = await categoryService.deleteMany(req.query.ids);

  return res.status(StatusCodes.OK).json(result);
}
