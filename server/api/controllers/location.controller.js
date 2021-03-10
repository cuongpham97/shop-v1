const { StatusCodes } = require('http-status-codes');
const locationService = require('~services/location.service');

exports.getProvinces = function (_req, res) {
  const provinces = locationService.getProvinces();

  return res.status(StatusCodes.OK).json({ provinces: provinces });
}

exports.getDistrictsAndWards = function (req, res) {
  const result = locationService.getDistrictsAndWards(req.params.code);

  return res.status(StatusCodes.OK).json(result);
}
