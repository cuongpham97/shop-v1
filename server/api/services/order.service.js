const validate = require('~utils/validate');
const { mongodb } = require('~database');
const Checkout = mongodb.model('checkout');
const Order = mongodb.model('order');
const Cart = mongodb.model('cart');
const moment = require('moment');

function _projectDocument(order) {
  if (order.toJSON) {
    order = order.toJSON();
  }

  return _.omit(order, ['__v']);
}

async function _filterFindQueryInput(query) {
  const validation = await validate(query, {
    'search': 'not_allow',
    'regexes': 'object|mongo_guard',
    'filters': 'object|mongo_guard',
    'orders': 'to:array',
    'orders.*': 'string|min:1|max:100|mongo_guard',
    'fields': 'to:array',
    'fields.*': 'string|min:1|max:100|mongo_guard',
    'page': 'integer|min:1',
    'pageSize': 'integer|min:1|max:200'
  });

  if (validation.errors) {
    throw new BadRequestException({
      code: 'WRONG_QUERY_PARAMETERS',
      message: `Invalid query parameters \`${validation.errors.keys().join(', ')}\``
    });
  }

  return validation.result;
}

exports.find = async function (query) { 
  query = await _filterFindQueryInput(query);
  return await Order.paginate(query, _projectDocument);
}

async function _filterFindByIdInput(input) {
  const validation = await validate(input, {
    'id': 'mongo_id',
    'fields': 'to:array',
    'fields.*': 'string|min:1|max:100|mongo_guard'
  });

  if (validation.errors) {
    throw new ValidationException({
      message: validation.errors.first()
    });
  }

  return validation.result;
}

exports.findById = async function (id, fields = []) {
  const input = await _filterFindByIdInput({ id, fields });

  const order = await Order.findById(input.id, input.fields);
  if (!order) {
    throw new NotFoundException({ 
      message: 'Order ID not does not exist' 
    });
  }

  return _projectDocument(order);
}

async function _filterNewOrderInput(input) {
  const validation = await validate(input, { 
    'customer': 'required|object',
    'customer._id': 'required|mongo_id',
    'message': 'string|max:2000',
    'shipping': 'required|object',
    'shipping.name': 'required|string|trim|max:200',
    'shipping.phone': 'required|string|trim|phone',
    'shipping.email': 'string|email',
    'shipping.address': 'required|location',
  });

  if (validation.errors) {
    throw new ValidationException({ 
      message: validation.errors.toArray() 
    });
  }

  return validation.result;
}

function _removeEmptyLine(cart) {
  cart.items = cart.items.filter(i => i.quantity);
}

async function _subtractItemInCart(cart, items, session) {
  for (const item of items) {

    const inCart = cart.items.find(i => i.product.equals(item.product) && i.sku.equals(item.sku));
    if (!inCart) {
      throw new BadRequestException({ 
        message: 'Product does not exist in cart' 
      });
    }
  
    if (inCart.quantity < item.quantity) {
      throw BadRequestException({
        message: 'Product not enough quantity in the cart'
      });
    }

    inCart.quantity -= item.quantity;
  }

  _removeEmptyLine(cart);
  await cart.save({ session });
}

async function _deleteCheckout(id, session) {
  await Checkout.findByIdAndDelete(id, { session });
}

async function _prepareNewOrder(input, session) {
  const checkout = await Checkout.findOne({ "customer": input.customer._id });
  if (!checkout) {
    throw new BadRequestException({ 
      message: 'Checkout information does not exist' 
    });
  }

  const cart = await Cart.findOne({ "customer": input.customer._id });
  if (!cart) {
    throw new BadRequestException({
      code: 'CART_IS_EXPIRED',
      message: 'Cart is expired'
    });
  }

  await _subtractItemInCart(cart, checkout.items, session);
  await _deleteCheckout(checkout._id, session);

  const order = new Order(_.assign(input, {
    customer: input.customer._id,
    items: checkout.items,
    totalPrice: checkout.totalPrice,
    shippingFee: checkout.shippingFee,
    total: checkout.total,
    status: [{
      name: 'PENDING',
      message: input.message,
      updatedAt: moment().format()
    }]
  }));

  return order;
}

exports.create = async function (customer, data) {
  const input = await _filterNewOrderInput({ customer, ...data })

  return await mongodb.transaction(async function (session, _commit, _abort) {
    const newOrder = await _prepareNewOrder(input, session);
    await newOrder.save({ session });

    return _projectDocument(newOrder);
  });
}

async function _filterNewOrderStatusInput(input) {
  const validation = await validate(input, { 
    'id': 'required|mongo_id',
    'name': 'required|enum:CANCELED,DENIED,SHIPPING,COMPLETED,EXPIRED',
    'message': 'required|string|max:2000'
  });

  if (validation.errors) {
    throw new ValidationException({ 
      message: validation.errors.toArray() 
    });
  }

  return validation.result;
}

function _prepareNewOrderStatus(input) {
  const status = { 
    name: input.name,
    message: input.message,
    updatedAt: moment().format()
  };

  return status;
}

exports.createStatus = async function (orderId, data) {
  const input = await _filterNewOrderStatusInput({ id: orderId, ...data });

  const order = await Order.findById(input.id);
  if (!order) {
    throw new NotFoundException({ 
      message: 'Order ID does not exist' 
    });
  }

  const status = _prepareNewOrderStatus(input);

  order.status.push(status);
  await order.save();

  return true;
}

async function _filterDeleteByIdInput(input) {
  const validation = await validate(input, { 
    'id': 'mongo_id' 
  });

  if (validation.errors) {
    throw new ValidationException({ 
      message: validation.errors.first() 
    });
  }

  return validation.result;
}

exports.deleteById = async function (id) {
  const input = await _filterDeleteByIdInput({ id });

  const order = await Order.findByIdAndDelete(input.id).select('_id');
  if (!order) {
    throw new NotFoundException({ 
      message: 'Order ID does not exist' 
    });
  }

  return {
    expected: 1,
    found: [input.id],
    deletedCount: 1
  };
}

async function _filterDeleteManyInput(input) {
  const validation = await validate(input, {
    'ids': 'to:array|unique',
    'ids.*': 'mongo_id'
  });

  if (validation.errors) {
    throw new ValidationException({ 
      message: validation.errors.toArray() 
    });
  }

  return validation.result;
}

exports.deleteMany = async function (ids) {
  const input = await _filterDeleteManyInput({ ids });

  const orders = await Order.find({ "_id": { "$in": input.ids } }).select('_id');
  if (!orders.length) {
    throw new NotFoundException({ 
      message: 'Order IDs does not exist' 
    });
  }

  const foundIds = orders.map(order => order._id);
  const result = await Order.deleteMany({ "_id": { "$in": foundIds } });
  
  return {
    expected: input.ids.length,
    found: foundIds,
    deletedCount: result.deletedCount
  };
}
