const wrap = require('async-middleware').wrap;
const router = require('express').Router();
const userCtrl = require('../controllers/user.controller');

router.get('/users', wrap(userCtrl.getManyUser));
router.post('/users', wrap(userCtrl.registerNewUserAccount));
router.patch('/users/:id', wrap(userCtrl.partialUpdateUser));
router.put('/users/:id/password', wrap(userCtrl.changeUserPassword));
router.delete('/users/:id', wrap(userCtrl.deleteUserById));

module.exports = router;
