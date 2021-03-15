const validate = require('~utils/validate');
const pricing = require('~libraries/pricing');
const { mongodb } = require('~database');
const Checkout = mongodb.model('checkout');
const Product = mongodb.model('product');
const Cart = mongodb.model('cart');
const moment = require('moment');

function _projectDocument(checkout) {
  if (checkout.toJSON) {
    checkout = checkout.toJSON();
  }

  return _.omit(checkout, ['__v']);
}

async function _filterFindByCustomerInput(input) {
  const validation = await validate(input, { 
    '_id': 'mongo_id'
  });

  if (validation.errors) {
    throw new ValidationException({ 
      message: validation.errors.toArray() 
    });
  }

  return validation.result;
}

exports.findByCustomer = async function (customer) {
  const input = await _filterFindByCustomerInput(customer);
  
  const before2day = moment().subtract(2, 'days');
  const checkout = await Checkout.findOne({
    "customer": input._id,
    "createdAt": { "$gt": before2day }
  });

  if (!checkout) {
    throw new NotFoundException({ 
      message: 'Checkout does not exist' 
    });
  }

  return _projectDocument(checkout);
}

async function _filterNewCheckoutInput(input) {
  const validation = await validate(input, {
    'customer': 'required|object',
    'customer._id': 'required|mongo_id',
    'customer.groups': 'required|array',
    'customer.groups.*': 'mongo_id',
    'items': 'required|array|min:1|max:10',
    'items.*.product': 'required|mongo_id',
    'items.*.sku': 'required|mongo_id',
    'items.*.quantity': 'required|integer|min:1'
  });

  if (validation.errors) {
    throw new ValidationException({ 
      message: validation.errors.toArray() 
    });
  }

  return validation.result;
}

async function _removeLastCheckout(customer) {
  await Checkout.deleteOne({ "customer": customer._id });
}

async function _prepareCheckoutItems(checkout, input) {
  const cart = await Cart.findOne({ "customer": input.customer._id });
  if (!cart) {
    throw new NotFoundException({ 
      message: 'Cart does not exits'
    });
  }

  const products = await Product.find({ 
    "_id": { "$in": input.items.map(i => i.product) }, 
    "active": true,
    "dateAvailable": { "$lte": moment().format() }
  })
  .select('-description')
  .lean();

  for (const [index, item] of input.items.entries()) {
    let { product, sku, quantity } = item;

    const inCart = cart.items.find(i => product.equals(i.product) && sku.equals(i.sku));
    if (!inCart) {
      throw new BadRequestException({ 
        message: `items.${index} does not exist in the cart`
      });
    }

    if (inCart.quantity < quantity) {
      throw new BadRequestException({ 
        message: `items.${index} not enough quantity in the cart` 
      });
    }

    product = products.find(i => product.equals(i._id));
    if (!product) {
      throw new NotFoundException({ 
        message: `item.${index} does not exist` 
      });
    }

    sku = product.skus.find(i => sku.equals(i._id));
    if (!sku) {
      throw new NotFoundException({ 
        message: `item.${index} does not exist` 
      });
    }

    const sellingPrice = pricing.productLinePrice(product, sku, quantity, input.customer);

    checkout.items.push({
      product: product._id,
      sku: sku._id,
      name: product.name,
      attributes: sku.attributes,
      images: sku.images,
      pricing: sellingPrice,
      quantity: quantity
    });
  }

  checkout.items = _.uniqWith(
    checkout.items, (a, b) => a.product.equals(b.product) && a.sku.equals(b.sku)
  );
}

async function _prepareNewCheckout(input) {
  await _removeLastCheckout(input.customer);

  const checkout = new Checkout({
    customer: input.customer._id,
    items: []
  });

  await _prepareCheckoutItems(checkout, input);

  checkout.totalPrice = checkout.items.reduce((sum, cur) => sum + cur.pricing.subtotal, 0);
  checkout.total = checkout.totalPrice;

  return checkout;
}

exports.create = async function (customer, data) {
  const input = await _filterNewCheckoutInput({ customer, ...data });

  const newCheckout = await _prepareNewCheckout(input);
  await newCheckout.save();
  
  return _projectDocument(newCheckout);
}
