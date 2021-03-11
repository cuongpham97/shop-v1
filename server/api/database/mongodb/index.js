const connect = require('./connect');
const transaction = require('./transaction');
const { Mongoose } = require('mongoose');
const mongoose = new Mongoose;

// Models
const customerGroupModel = require('./models/customer-group.model');
const customerModel = require('./models/customer.model');
const adminModel = require('./models/admin.model');
const roleModel = require('./models/role.model');
const cartModel = require('./models/cart.model');
const orderModel = require('./models/order.model');
const imageModel = require('./models/image.model');
const productModel = require('./models/product.model');
const categoryModel = require('./models/category.model');
const checkoutModel = require('./models/checkout.model');

// Plugins
const pagination = require('./plugins/pagination');
const timestamp = require('./plugins/timestamp');
const formatValidateError = require('./plugins/format-validate-error');

const models = [
  customerGroupModel,
  customerModel, 
  adminModel, 
  roleModel,
  cartModel,
  orderModel,
  imageModel, 
  productModel,
  categoryModel,
  checkoutModel
];

const plugins = [
  timestamp, 
  pagination, 
  formatValidateError
];

async function init() {

  // Connect to database, convert calback to async
  await new Promise(resolve => connect(mongoose, resolve));

  // Use plugins
  models.forEach(model => {
    plugins.forEach(plugin => model.schema && model.schema.plugin(plugin));
  });

  // Use models
  models.forEach(model => model.apply(mongoose));

  return mongoose;
}

module.exports = new Proxy(mongoose, { 
  get: function (_target, property, _receiver) {

    switch (property) {

      case 'init': 
        return init;

      case 'instance':
        return mongoose;

      case 'transaction': 
        return transaction(mongoose);

      default:
        return mongoose[property];
    }

  }
});
