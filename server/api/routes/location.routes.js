const router = require('express').Router();
const locationCtrl = require('~controllers/location.controller');
const tools = require('~utils/tools');

module.exports = tools.applyRoutes(router, [
  
  ['GET', '/locations/provinces', locationCtrl.getProvinces],
  ['GET', '/locations/provinces/:code', locationCtrl.getDistrictsAndWards]

]);
