const imageCtrl = require('~controllers/image.controller');
const tools = require('~utils/tools');
const router = tools.createRouter();

router.post('/images', imageCtrl.uploadImage);

module.exports = router;

