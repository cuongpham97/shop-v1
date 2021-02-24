const validate = require('~utils/validate');
const { mongodb } = require('~database');
const pricing = require('~libraries/pricing');
const moment = require('moment');

exports.findByCustomer = async function (customerId, customerGroup = []) {

  const validation = await validate(
    { 'id': customerId, 'group': customerGroup }, 
    { 
      'id': 'mongo_id',
      'group': 'to:array',
      'group.*': 'mongo_id' 
    } 
  );

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors.toArray() });
  }

  customerId = validation.result.id;
  customerGroup = validation.result.group;

  const cart = await mongodb.model('cart').findOne({ "customer": customerId });

  if (!cart) return { items: [] };

  const productIds = cart.items.map(item => item.product);
  const products = await mongodb.model('product').find({ "_id": { "$in": productIds } });

  const now = moment();

  const items = cart.items.map(item => {

    const product = products.find(product => product._id.equals(item.product));
    
    if (!product) return undefined;

    const sku = product.skus.find(sku => sku._id.equals(item.sku));

    if (!sku) return undefined;

    // TODO: calculate price
    //const salePrice = pricing.calcSalePrice(product, sku);

    return {
      product: product._id,
      sku: sku._id,
      name: product.name,
      attributes: sku.attributes,
      images: sku.images,
      //price
      //sale
      quantity: item.quantity,
      inventory: sku.quantity
    };
  });

  return { items: items.filter(Boolean) }; 
}

exports.setCartItem = async function (customerId, item) {
  
  const data = item;
  data.id = customerId;

  const validation = await validate(data, {
    'id': 'mongo_id',
    'product': 'required|mongo_id',
    'sku': 'required|mongo_id',
    'quantity': 'required|integer|min:0'
  });

  if (validation.errors) {
    throw new ValidationException({ message: validation.errors.toArray() });
  }

  customerId = validation.result.id;
  _.unset(validation.result, 'id');

  item = validation.result;

  return await mongodb.transaction(async function (session, _commit, _abort) {

    const product = await mongodb.model('product').findById(item.product).select('_id skus');

    if (!product) {
      throw new NotFoundException({ message: 'Product ID does not exist' });
    }

    const sku = product.skus.find(sku => sku._id.equals(item.sku));

    if (!sku) {
      throw new NotFoundException({ message: 'Sku ID does not exist' });
    }

    let cart = await mongodb.model('cart').findOne({ customer: customerId });

    if (!cart) {
      cart = await mongodb.model('cart').create({
        customer: customerId,
        items: []
      });
    }

    const inCart = cart.items.find(line => line.product.equals(item.product) && line.sku.equals(item.sku));

    if (!inCart) {

      if (item.quantity < 0) {
        throw new BadRequestException({
          code: 'CANNOT_BE_LESS_THAN_ZERO',
          message: 'Quantity in cart cannot be less than 0'
        });
      }

      const picked = await mongodb.model('product').findOneAndUpdate(
        {
          "_id": item.product,
          "skus": { "$elemMatch": { "_id": item.sku, "quantity": { "$gte": item.quantity } } }
        },
        { "$inc": { "skus.$.quantity": -item.quantity } },
        { new: true, session }
      );
  
      if (!picked) {
        throw new BadRequestException({ 
          code: 'NOT_ENOUGH_QUANTITY',
          message: 'Not enough product quantity' 
        });
      }
  
      cart.items.push(item);
  
      //remove empty cart line
      cart.items = cart.items.filter(line => line.quantity);
      
      await cart.save({ session });
    
    } else {

      if (item.quantity < 0 && inCart.quantity < -item.quantity) {
        throw new BadRequestException({
          code: 'CANNOT_BE_LESS_THAN_ZERO',
          message: 'Quantity in cart cannot be less than 0' 
        });
      }

      const delta = item.quantity - inCart.quantity;
  
      const picked = await mongodb.model('product').findOneAndUpdate(
        {
          "_id": item.product,
          "skus": { "$elemMatch": { "_id": item.sku, "quantity": { "$gte": delta } } }
        },
        { "$inc": { "skus.$.quantity": -delta } },
        { new: true, session }
      );
  
      if (!picked) {
        throw new BadRequestException({
          code: 'NOT_ENOUGH_QUANTITY', 
          message: 'Not enough product quantity' 
        });
      }
  
      inCart.quantity = item.quantity;
  
      //remove empty cart line
      cart.items = cart.items.filter(item => item.quantity);
      
      await cart.save(session);
    }
  
    return item;
  });
}
