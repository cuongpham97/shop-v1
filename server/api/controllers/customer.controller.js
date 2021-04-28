const { StatusCodes } = require('http-status-codes');
const customerService  = require('~services/customer.service');

exports.checkExistCustomer = async function (req, res) {
  const isExist = await customerService.checkExist(req.query);

  return res.status(StatusCodes.OK).json({ existed: isExist });
}

exports.getCustomerById = async function (req, res) {
  const customer = await customerService.findById(req.params.id, req.query.fields);

  return res.status(StatusCodes.OK).json(customer);
}

exports.registerNewCustomerAccount = async function (req, res) {
  const newCustomer = await customerService.create(req.body);
  
  return res.status(StatusCodes.OK).json(newCustomer);
}

exports.partialUpdateCustomer = async function (req, res) {
  const customer = await customerService.partialUpdate(req.params.id, req.body, req.user.type);

  return res.status(StatusCodes.OK).json(customer);
}

exports.changeCustomerPassword = async function (req, res) {
  await customerService.changePassword(req.params.id, req.body, req.user.type);

  return res.status(StatusCodes.NO_CONTENT).end();
}

exports.getManyCustomers = async function (req, res) {
  const customers = await customerService.find(req.query);

  return res.status(StatusCodes.OK).json(customers);
}

exports.deleteCustomerById = async function (req, res) {
  const result = await customerService.deleteById(req.params.id);

  return res.status(StatusCodes.OK).json(result);
}

exports.deleteManyCustomers = async function (req, res) {
  const result = await customerService.deleteMany(req.query.ids);

  return res.status(StatusCodes.OK).json(result);
}
