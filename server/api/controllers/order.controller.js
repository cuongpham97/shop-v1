const { StatusCodes } = require('http-status-codes');
const orderService = require('~services/order.service');

exports.getOrderById = async function (req, res) {
  const order = await orderService.findById(req.params.id);

  return res.status(StatusCodes.OK).json(order);
}

exports.getManyOrder = async function (req, res) {
  const orders = await orderService.find(req.query);

  return res.status(StatusCodes.OK).json(orders);
}

exports.createNewOrder = async function (req, res) {
  const newOrder = await orderService.create(req.body, req.user);

  return res.status(StatusCodes.OK).json(newOrder);
}

exports.createOrderStatus = async function (req, res) {
  await orderService.createStatus(req.params.id, req.body);

  return res.status(StatusCodes.NO_CONTENT).end();
}

exports.deleteOrderById = async function (req, res) {
  const result = orderService.deleteById(req.params.id);

  return res.status(StatusCodes.OK).json(result);
}

exports.deleteManyOrder = async function (req, res) {
  const result = orderService.deleteMany(req.query.ids);

  return res.status(StatusCodes.OK).json(result);
}
