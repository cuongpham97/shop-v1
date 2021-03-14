const validate = require('~utils/validate');
const pricing = require('~libraries/pricing');
const { mongodb } = require('~database');
const Product = mongodb.model('product');
const Cart = mongodb.model('cart');

exports.findByCustomer = async function (customer) {
  const items = [];

  const cart = await Cart.findOne({ "customer": customer._id });
  if (!cart) return { items };

  const products = await Product.find({ "_id": { "$in": cart.items.map(item => item.product) } });

  for (const item of cart.items) {
    const product = products.find(product => product._id.equals(item.product));
    if (!product) continue;

    const sku = product.skus.find(sku => sku._id.equals(item.sku));
    if (!sku) continue;

    const sellingPrice = pricing.productLinePrice(product, sku, item.quantity, customer);

    items.push({
      product: product._id,
      sku: sku._id,
      name: product.name,
      attributes: sku.attributes,
      images: sku.images,
      pricing: sellingPrice,
      quantity: item.quantity,
      inventory: sku.quantity
    });
  }

  return { items }; 
}

async function _filterSetCartItemInput(input) {
  const validation = await validate(input, {
    'id': 'required|mongo_id',
    'product': 'required|mongo_id',
    'sku': 'required|mongo_id',
    'quantity': 'required|integer|min:0'
  });

  if (validation.errors) {
    throw new ValidationException({ 
      message: validation.errors.toArray() 
    });
  }

  return validation.result;
}

function _findItemLineInCart(cart, product, sku) {
  return cart.items.find(line => line.product.equals(product) && line.sku.equals(sku));
}

function _removeEmptyLine(cart) {
  cart.items = cart.items.filter(line => line.quantity);
}

async function _subtractInventory(product, sku, quantity, session) {
  const picked = await Product.findOneAndUpdate(
    {
      "_id": product,
      "skus": { "$elemMatch": { "_id": sku, "quantity": { "$gte": quantity } } }
    },
    { "$inc": { "skus.$.quantity": -quantity } },
    { new: true, projection: '_id', session }
  );

  if (!picked) {
    throw new BadRequestException({ 
      code: 'NOT_ENOUGH_QUANTITY',
      message: 'Not enough product quantity' 
    });
  }
}

async function _addToCart(cart, item, session) {
  await _subtractInventory(item.product, item.sku, item.quantity, session);

  cart.items.push(item);
}

async function _updateCartLine(line, quantity, session) {
  const increasement = quantity - line.quantity;
  await _subtractInventory(line.product, line.sku, increasement, session);

  line.quantity = quantity;
}

exports.setCartItem = async function (customerId, item) {
  const input = await _filterSetCartItemInput({ id: customerId, ...item });

  const product = await Product.findById(input.product);
  if (!product) {
    throw new NotFoundException({ 
      message: 'Product ID does not exist'
    });
  }

  const sku = product.skus.find(sku => sku._id.equals(input.sku));
  if (!sku) {
    throw new NotFoundException({ 
      message: 'Sku ID does not exist' 
    });
  }

  const cart = await Cart.findOne({ "customer": input.id }) 
    || await Cart.create({ customer: input.id, items: [] });
  
  return await mongodb.transaction(async function (session, _commit, _abort) {
    const inCart = _findItemLineInCart(cart, input.product, input.sku);
    
    if (inCart) {
      await _updateCartLine(inCart, input.quantity, session);
    } else {
      await _addToCart(cart, input, session);
    }
      
    _removeEmptyLine(cart);
    await cart.save({ session });

    return true;
  });
}
