const wrap = require('async-middleware').wrap;
const router = require('express').Router();
const userCtrl = require('~controllers/user.controller');

router.get('/users/:id', wrap(userCtrl.getUserById));
router.post('/users', wrap(userCtrl.registerNewUserAccount));
router.patch('/users/:id', wrap(userCtrl.partialUpdateUser));
router.put('/users/:id/password', wrap(userCtrl.changeUserPassword));
router.delete('/users/:id', wrap(userCtrl.deleteUserById));

router.get('/admin/users', wrap(userCtrl.getManyUser));
router.get('/admin/users/:id', wrap(userCtrl.getUserById));
router.patch('/admin/users/:id', wrap(userCtrl.partialUpdateUser));
router.put('/admin/users/:id/password', wrap(userCtrl.changeUserPassword));
router.delete('/admin/users/:id', wrap(userCtrl.deleteUserById));
router.delete('/admin/users', wrap(userCtrl.deleteManyUser));

module.exports = router;
