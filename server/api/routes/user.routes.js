const wrap = require('async-middleware').wrap;
const router = require('express').Router();
const userController = require('../controllers/user.controller');

router.post('/users', wrap(userController.registerNewUserAccount));

module.exports = router;
