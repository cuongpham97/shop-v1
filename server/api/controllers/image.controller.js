const { StatusCodes } = require('http-status-codes');
const imageService = require('~services/image.service');

exports.uploadImage = async function (req, res) {
  
  const result = await imageService.upload(req.body);

  return res.status(StatusCodes.OK).json(result);
}
