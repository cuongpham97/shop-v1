const locationCtrl = require('~controllers/location.controller');
const tools = require('~utils/tools');
const router = tools.createRouter();

router.get('/locations/provinces', locationCtrl.getProvinces);
router.get('/locations/provinces/:code', locationCtrl.getDistrictsAndWards);

module.exports = router;
