const { Schema } = require('mongoose');

const Item = new Schema({
  product: {
    type: ObjectId,
    ref: 'product',
    required: true
  },
  sku: {
    type: ObjectId,
    ref: 'product.skus',
    required: true
  },
  quantity: {
    type: Number,
    min: 1,
    required: true
  }
}, { _id: false });

const CartSchema = new Schema({
  customer: {
    type: ObjectId,
    ref: 'customer',
    required: true
  },
  items: {
    type: [Item],
    default: []
  }
});

module.exports = CartSchema;
