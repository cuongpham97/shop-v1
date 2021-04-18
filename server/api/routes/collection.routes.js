const cltCtrl = require('~controllers/collection.controller');
const auth = require('~middleware/auth');
const tools = require('~utils/tools');
const router = tools.createRouter();

async function _attempAuth(req, res, next) {
  try {
    await auth('customer').get('groups')(req, res);
  } finally {
    return next();
  }
}

router.get('/collections', _attempAuth, cltCtrl.getAllProducts);
router.get('/collections/newArrival', _attempAuth, cltCtrl.getNewArrival);

router.get('/collections/products/:id', _attempAuth, cltCtrl.getProductById);

module.exports = router;
