const checkoutCtrl = require('~controllers/checkout.controller');
const auth = require('~middleware/auth');
const tools = require('~utils/tools');
const router = tools.createRouter();

router.get('/checkouts', auth('customer'), checkoutCtrl.getCheckoutByCustomer);
router.post('/checkouts', auth('customer').get('groups'), checkoutCtrl.createNewCheckout);

module.exports = router;
