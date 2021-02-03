const router = require('express').Router();
const imageCtrl = require('~controllers/image.controller');
const tools = require('~utils/tools');

module.exports = tools.applyRoutes(router, [

  ['POST', '/images', imageCtrl.uploadImage ]

]);
