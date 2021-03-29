const productCtrl = require('~controllers/product.controller');
const auth = require('~middleware/auth');
const tools = require('~utils/tools');
const router = tools.createRouter();

router.get('/admin/products/:id', auth('admin').can('product.read'), productCtrl.getProductById);
router.get('/admin/products', auth('admin').can('product.read'), productCtrl.getManyProducts);
router.post('/admin/products', auth('admin').can('product.create'), productCtrl.createNewProduct);
router.patch('/admin/products/:id', auth('admin').can('product.update'), productCtrl.partialUpdateProduct);
router.delete('/admin/products/:id', auth('admin').can('product.delete'), productCtrl.deleteProductById);
router.delete('/admin/products', auth('admin').can('product.delete'), productCtrl.deleteManyProducts);

module.exports = router;
