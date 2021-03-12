const validate = require('~utils/validate');
const { mongodb } = require('~database');
const moment = require('moment');

exports.find = async function (query) { 
  
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
      message: 'Query string parameter `' + validation.errors.keys().join(', ') + '` is invalid' 
    });
  }

  return await mongodb.model('order').paginate(validation.result);
}

exports.findById = async function (id, fields = null) {
  
  const validation = await validate({ 'id': id }, { 'id': 'mongo_id' });

  if (validation.errors) {
    throw new ValidationException({ 
      code: 'WRONG_QUERY_PARAMS',
      message: validation.errors.first()
    });
  }

  id = validation.result.id;

  const order = await mongodb.model('order').findById(id, fields);

  if (!order) {
    throw new NotFoundException({ message: 'Order ID not does not exist' });
  }

  return order;
}

exports.create = async function (order, customer) {

  order.customer = customer._id;

  const validation = await validate(order, { 
    'customer': 'required|mongo_id',
    'message': 'string|max:2000',
    'shipping': 'required|object',
    'shipping.name': 'required|string|trim|max:200',
    'shipping.phone': 'required|string|trim|phone',
    'shipping.email': 'string|email',
    'shipping.address': 'required|location',
  });

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors.toArray() });
  }

  customerId = validation.result.customer;
  order = validation.result;

  return await mongodb.transaction(async function (session, _commit, _abort) {
  
    const checkout = await mongodb.model('checkout').findOne({ "customer": customerId });

    if (!checkout) {
      throw new BadRequestException({ message: 'Checkout information does not exist' });
    }
  
    const cart = await mongodb.model('cart').findOne({ "customer": customerId });
  
    if (!cart) {
      throw new BadRequestException({
        code: 'CART_IS_EXPIRED',
        message: 'Cart is expired'
      });
    }
  
    order = _.assign(order, {
      items: checkout.items,
      totalPrice: checkout.totalPrice,
      shippingFee: checkout.shippingFee,
      total: checkout.total,
      status: [{
        name: 'PENDING',
        message: order.message,
        updatedAt: moment().format()
      }]
    });

    const [newOrder] = await mongodb.model('order').create([order], { session });

    // Subtract items quantity from cart
    checkout.items.forEach(checkoutItem => {
      const inCart = cart.items.find(cartItem => checkoutItem.product.equals(cartItem.product) && checkoutItem.sku.equals(cartItem.sku));
    
      if (!inCart) {
        throw new BadRequestException({ message: 'Product does not exist in cart' });
      }

      if (inCart.quantity < checkoutItem.quantity) {
        throw BadRequestException('Product not enough quantity in the cart');
      }

      inCart.quantity -= checkoutItem.quantity;
    });

    cart.items = cart.items.filter(item => item.quantity);
    await cart.save({ session });

    // Delete checkout
    await mongodb.model('checkout').findByIdAndDelete(checkout._id);

    return newOrder;
  });
}

exports.createStatus = async function (orderId, status) {
  status.id = orderId;

  const validation = await validate(status, { 
    'id': 'required|mongo_id',
    'name': 'required|enum:CANCELED,DENIED,SHIPPING,COMPLETED,EXPIRED',
    'message': 'required|string|max:2000'
  });

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors.toArray() });
  }

  orderId = validation.result.id;
  _.unset(status, 'id');

  status = validation.result;
  
  status.updatedAt = moment().format();

  const order = await mongodb.model('order').findById(orderId);

  if (!order) {
    throw new NotFoundException({ message: 'Order ID does not exist' });
  }

  order.status.push(status);
  await order.save();

  return true;
}

exports.deleteById = async function (id) {

  const validation = await validate({ 'id': id }, { 'id': 'mongo_id' } );

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors.first() });
  }

  id = validation.result.id;

  const order = await mongodb.model('order').findByIdAndDelete(id).select('_id');

  if (!order) {
    throw new NotFoundException({ message: 'Order ID does not exist' });
  }

  return {
    expected: 1,
    found: [id],
    deletedCount: 1
  };
}

exports.deleteMany = async function (ids) {

  const validation = await validate({ 'ids': ids }, {
    'ids': 'to:array|unique',
    'ids.*': 'mongo_id'
  });

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors.toArray() });
  }

  ids = validation.result.ids;

  const docs = await mongodb.model('order').find({ "_id": { "$in": ids } }).select('_id');
  
  if (!docs.length) {
    throw new NotFoundException({ message: 'Order IDs does not exist' });
  }

  const found = docs.map(doc => doc._id);
  const result = await mongodb.model('order').deleteMany({ "_id": { "$in": found } });
  
  return {
    expected: ids.length,
    found: found,
    deletedCount: result.deletedCount
  };
}
