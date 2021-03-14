const catCtrl = require('~controllers/category.controller');
const auth = require('~middleware//auth');
const tools = require('~utils/tools');
const router = tools.createRouter();

router.get('/categories/tree', catCtrl.getCategoriesTree);
router.get('/admin/categories', auth('admin').can('category.read'), catCtrl.getManyCategory);
router.post('/admin/categories', auth('admin').can('category.create'), catCtrl.createNewCategory);
router.patch('/admin/categories/:id', auth('admin').can('category.update'),catCtrl.partialUpdateCategory);
router.delete('/admin/categories/:id', auth('admin').can('category.delete'),catCtrl.deleteCategoryById);
router.delete('/admin/categories', auth('admin').can('category.delete'), catCtrl.deleteManyCategory);

module.exports = router;
