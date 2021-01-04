const wrap = require('async-middleware').wrap;
const router = require('express').Router();
const userController = require('../controllers/user.controller');

router.get('/users', wrap(userController.getManyUser));
router.post('/users', wrap(userController.registerNewUserAccount));

module.exports = router;
