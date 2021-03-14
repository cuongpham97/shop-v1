const catCtrl = require('~controllers/category.controller');
const tools = require('~utils/tools');
const router = tools.createRouter();

router.get('/categories/tree', catCtrl.getCategoriesTree);
router.get('/admin/categories', catCtrl.getManyCategory);
router.post('/admin/categories', catCtrl.createNewCategory);
router.patch('/admin/categories/:id', catCtrl.partialUpdateCategory);
router.delete('/admin/categories/:id', catCtrl.deleteCategoryById);
router.delete('/admin/categories', catCtrl.deleteManyCategory);

module.exports = router;
