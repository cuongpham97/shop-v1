const categoryCtrl = require('~controllers/category.controller');
const tools = require('~utils/tools');
const router = tools.createRouter();

router.get('/categories/tree', categoryCtrl.getCategoriesTree);
router.get('/admin/categories', categoryCtrl.getManyCategory);
router.post('/admin/categories', categoryCtrl.createNewCategory);
router.patch('/admin/categories/:id', categoryCtrl.partialUpdateCategory);
router.delete('/admin/categories/:id', categoryCtrl.deleteCategoryById);
router.delete('/admin/categories', categoryCtrl.deleteManyCategory);

module.exports = router;
