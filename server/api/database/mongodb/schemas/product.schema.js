const { Schema } = require('mongoose');
const ObjectId = Schema.Types.ObjectId;

const Variant = new Schema({
  control: {
    type: String,
    uppercase: true,
    enum: [
      'DROP_DOWN',
      'COLOR_PICKER',
      'MULTIPLE_CHOICE'
    ],
    required: true
  },
  name: {
    type: String,
    minLength: 1,
    maxLength: 200,
    required: true
  }
}, { _id: false });

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

const Discount = new Schema({
  customerGroup: {
    type: ObjectId
  },
  quantity: {
    type: Number,
    min: 1,
    required: true
  },
  priority: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    min: 0,
    required: true
  },
  effectiveDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date
  }
}, { _id: false });

const Special = new Schema({
  customerGroup: {
    type: ObjectId
  },
  priority: {
    type: Number,
    default: 0
  },
  salePrice: {
    type: Number,
    min: 0
  },
  effectiveDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date
  }
}, { _id: false });

const Sku = new Schema({
  code: {
    type: String,
    minLength: 1,
    maxLength: 200
  },
  images: [Image],
  attributes: [Attribute],
  quantity: {
    type: Number,
    min: 0,
    required: true
  },
  additionPrice: {
    sign: {
      type: String,
      enum: ['-', '+'],
      default: '+'
    },
    value: {
      type: Number,
      default: 0
    }
  },
  price: {
    type: Number,
    min: 0
  },
  special: [Special],
  discount: [Discount],
  order: {
    type: Number,
    default: 0
  }
});

const Rating = new Schema({
  1: {
    type: Number,
    default: 0
  },
  2: {
    type: Number,
    default: 0
  },
  3: {
    type: Number,
    default: 0
  },
  4: {
    type: Number,
    default: 0
  },
  5: {
    type: Number,
    default: 0
  },
  count: {
    type: Number,
    default: 0
  },
  average: {
    type: Number,
    default: 0
  }
}, { _id: false });

const ProductSchema = new Schema({
  name: {
    type: String,
    minLength: 1,
    maxLength: 200,
    required: true
  },
  slug: {
    type: String,
    minLength: 1,
    maxLength: 200,
    required: true
  },
  title: {
    type: String,
    maxLength: 1000
  },
  categories: [{
    _id: {
      type: ObjectId,
      ref: 'category'
    },
    path: String
  }],
  model: {
    type: String,
    minLength: 1,
    maxLength: 200
  },
  brand: {
    type: String,
    minLength: 1,
    maxLength: 200
  },
  description: {
    type: String,
    maxLength: 4000
  },
  warranty: String,
  attributes: [Attribute],
  pricingTemplate: {
    type: String,
    uppercase: true,
    enum: ['PRODUCT', 'VARIANT'],
    required: true
  },
  price: {
    type: Number,
    min: 0
  },
  special: [Special],
  discount: [Discount],
  variants: [Variant],
  skus: [Sku],
  viewed: {
    type: Number,
    default: 0
  },
  rating: Rating,
  dateAvailable: {
    type: Date
  },  
  active: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
});

module.exports = ProductSchema;
