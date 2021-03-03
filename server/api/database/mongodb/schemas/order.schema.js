const { Schema } = require('mongoose');
const { regexes } = require('~utils/constants');
const Location = require('./location.schema');

const Attribute = new Schema({
  name: {
    type: String,
    minLength: 1,
    maxLength: 200,
    required: true
  },
  value: {
    type: String,
    maxLength: 200
  }
}, { _id: false });

const Image = new Schema({
  type: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  width: Number,
  height: Number,
  size: Number
});

const Pricing = new Schema({
  price: {
    type: Number,
    min: 0,
    required: true
  },
  nomarlPrice: {
    type: Number,
    min: 0,
    required: true
  },
  salePrice: {
    type: Number,
    min: 0
  },
  percentageSale: {
    type: Number,
    min: 0
  },
  discount: {
    type: Number,
    min: 0
  },
  subtotal: {
    type: Number,
    min: 0
  }
});

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
  name: {
    type: String,
    required: true
  },
  attributes: [Attribute],
  images: [Image],
  pricing: Pricing,
  quantity: {
    type: Number,
    min: 1,
    required: true
  }
}, { _id: false });

const Status = new Schema({
  name: {
    type: String,
    enum: [],
    required: true
  },
  comment: {
    type: String,
    maxLength: 2000
  },
  updatedAt: {
    type: Date,
    required: true
  }
});

const OrderSchema = new Schema({
  customer: {
    type: ObjectId,
    ref: 'customer'
  },
  items: [Item],
  totalPrice: {
    type: Number,
    min: 0,
    required: true
  },
  shippingFee: {
    type: Number,
    min: 0,
    default: 0
  },
  total: {
    type: Number,
    min: 0,
    required: true
  },
  status: [Status],
  shipping: {
    name: {
      type: String,
      trim: true,
      maxLength: 200,
      required: true
    },
    phone: {
      type: String,
      trim: true,
      match: regexes.PHONE_NUMBER,
      required: true
    },
    email: {
      type: String,
      trim: true,
      match: regexes.EMAIL
    },
    address: {
      type: Location,
      required: true
    }
  }
});

module.exports = OrderSchema;
