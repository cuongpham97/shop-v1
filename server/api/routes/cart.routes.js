const cartCtrl = require('~controllers/cart.controller');
const auth = require('~middleware/auth');
const tools = require('~utils/tools');
const router = tools.createRouter();

router.get('/carts', auth('customer').get('groups') , cartCtrl.getCurrentUserCart);
router.post('/carts/items', auth('customer'), cartCtrl.setCurrentUserCartItem);

module.exports = router;
