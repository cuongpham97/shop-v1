const { StatusCodes } = require('http-status-codes');
const groupService  = require('~services/customer-group.service');

exports.getManyCustomerGroup = async function (req, res) {
  const groups = await groupService.find(req.query);

  return res.status(StatusCodes.OK).json(groups);
}

exports.getCustomerGroupById = async function (req, res) {
  const group = await groupService.findById(req.params.id, req.query.fields);

  return res.status(StatusCodes.OK).json(group);
}

exports.createCustomerGroup = async function (req, res) {
  const newGroup = await groupService.create(req.body);

  return res.status(StatusCodes.OK).json(newGroup);
};

exports.partialUpdateCustomerGroup = async function (req, res) {
  const group = await groupService.partialUpdate(req.params.id, req.body);

  return res.status(StatusCodes.OK).json(group);
}

exports.deleteCustomerGroupById = async function (req, res) {
  const result = await groupService.deleteById(req.params.id);

  return res.status(StatusCodes.OK).json(result);
}

exports.deleteManyCustomerGroup = async function (req, res) {
  const result = await groupService.deleteMany(req.query.ids);

  return res.status(StatusCodes.OK).json(result);
}
