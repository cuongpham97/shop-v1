const cltCtrl = require('~controllers/collection.controller');
const tools = require('~utils/tools');
const router = tools.createRouter();

router.get('/collections', cltCtrl.getAllProducts);
router.get('/collections/newArrival', cltCtrl.getNewArrival);

module.exports = router;
