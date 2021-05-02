const { StatusCodes } = require('http-status-codes');
const orderService = require('~services/order.service');

exports.getCustomerOrders = async function (req, res) {
  const query =  _.merge(req.query || {}, { 
    filters: { customer: req.user._id } 
  });
  
  const dataset = await orderService.find(query);
  return res.status(StatusCodes.OK).json(dataset);
}

exports.getCustomerOrderById = async function (req, res) {
  const order = await orderService.findById(req.params.id);

  if (!req.user._id.equals(order.customer)) {
    throw new AuthorizationException({
      message: 'Don\'t have permission to access'
    });
  }

  return res.status(StatusCodes.OK).json(order);
}

exports.cancelOrder = async function (req, res) {
  const body =_.merge(req.body, { name: 'CANCELED' });
  await orderService.createStatus(req.params.id, body, req.user);

  return res.status(StatusCodes.NO_CONTENT).end();
}

exports.getOrderById = async function (req, res) {
  const order = await orderService.findById(req.params.id);

  return res.status(StatusCodes.OK).json(order);
}

exports.getManyOrders = async function (req, res) {
  const orders = await orderService.find(req.query);

  return res.status(StatusCodes.OK).json(orders);
}

exports.createNewOrder = async function (req, res) {
  const newOrder = await orderService.create(req.user, req.body);

  return res.status(StatusCodes.OK).json(newOrder);
}

exports.createOrderStatus = async function (req, res) {
  await orderService.createStatus(req.params.id, req.body);

  return res.status(StatusCodes.NO_CONTENT).end();
}

exports.deleteOrderById = async function (req, res) {
  const result = await orderService.deleteById(req.params.id);

  return res.status(StatusCodes.OK).json(result);
}

exports.deleteManyOrders = async function (req, res) {
  const result = await orderService.deleteMany(req.query.ids);

  return res.status(StatusCodes.OK).json(result);
}
