const validate = require('~utils/validate');
const pricing = require('~libraries/pricing');
const { mongodb } = require('~database');
const moment = require('moment');

exports.findByCustomer = async function (customer) {

  const validation = await validate(customer, { 
    '_id': 'mongo_id'
  });

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors.toArray() });
  }

  customer = validation.result;

  const checkout = await mongodb.model('checkout').findOne({
    "customer": customer._id,
    "createdAt": { "$gt": moment().subtract(2, 'days') }
  });

  if (!checkout) {
    throw new NotFoundException({ message: 'Checkout does not exist' });
  }

  return checkout;
}

exports.create = async function (customer, data) {

  data.customer = customer;

  const validation = await validate(data, {
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
    throw new ValidationException({ message: validation.errors.toArray() });
  }

  customer = validation.result.customer;
  const items = validation.result.items;

  return await mongodb.transaction(async function (session, _commit, _abort) {
    
    const cart = await mongodb.model('cart').findOne({ "customer": customer._id });

    if (!cart) {
      throw new NotFoundException({ message: 'Cart does not exist' });
    }

    // Remove last checkout 
    await mongodb.model('checkout').findOneAndDelete({ "customer": customer._id });

    const productIds = items.map(item => item.product);
    
    const products = await mongodb.model('product')
      .find({ "_id": { "$in": productIds }, "active": true })
      .lean();


    let checkout = {
      customer: customer._id,
      items: []
    };

    for (let [index, { product, sku, quantity }] of items.entries()) {
      
      const inCart = cart.items.find(i => product.equals(i.product) && sku.equals(i.sku));

      if (!inCart) {
        throw new BadRequestException({ message: `items.${index} does not exist in the cart`});
      }

      if (inCart.quantity < quantity) {
        throw new BadRequestException({ message: `items.${index} not enough quantity in the cart` });
      }

      product = products.find(i => product.equals(i._id));

      if (!product) {
        throw new NotFoundException({ message: `items.${index} does not exist` });
      }

      sku = product.skus.find(i => sku.equals(i._id));

      if (!sku) {
        throw new NotFoundException({ message: `item.${index} does not exist` });
      }

      const sellingPrice = pricing.productLinePrice(product, sku, quantity, customer);

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

    checkout.totalPrice = checkout.items.reduce((sum, cur) => sum + cur.pricing.subtotal, 0);
    checkout.total = checkout.totalPrice;

    [newCheckout] = await mongodb.model('checkout').create([checkout], { session });
  
    return newCheckout;
  });
}
