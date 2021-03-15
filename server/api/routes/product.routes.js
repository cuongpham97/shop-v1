const productCtrl = require('~controllers/product.controller');
const tools = require('~utils/tools');
const router = tools.createRouter();

router.get('/admin/products', productCtrl.getManyProducts);
router.post('/admin/products', productCtrl.createNewProduct);
router.patch('/admin/products/:id', productCtrl.partialUpdateProduct);
router.delete('/admin/products/:id', productCtrl.deleteProductById);
router.delete('/admin/products', productCtrl.deleteManyProducts);

module.exports = router;
