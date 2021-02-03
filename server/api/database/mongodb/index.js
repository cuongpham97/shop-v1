const connect = require('./connect');
const transaction = require('./transaction');
const { Mongoose } = require('mongoose');
const mongoose = new Mongoose;

// Models
const userModel = require('./models/user.model');
const adminModel = require('./models/admin.model');
const roleModel = require('./models/role.model');
const imageModel = require('./models/image.model');

// Plugins
const pagination = require('./plugins/pagination');
const timestamp = require('./plugins/timestamp');
const formatValidateError = require('./plugins/format-validate-error');

const models = [userModel, adminModel, roleModel, imageModel];
const plugins = [timestamp, pagination, formatValidateError];

function init() {

  return new Promise(function (resolve, _reject) {

    // Connect to database, convert calback to async
    connect(mongoose, () => resolve());

    // Use plugins
    models.forEach(model => {
      plugins.forEach(plugin => model.schema && model.schema.plugin(plugin));
    });
  
    // Use models
    models.forEach(model => model.apply(mongoose));
  
    return mongoose;
  });
}

module.exports = new Proxy(mongoose, { 
  get: function (_target, property, _receiver) {

    switch (property) {

      case 'init': 
        return init;

      case 'instace':
        return mongoose;

      case 'transaction': 
        return transaction(mongoose);

      default:
        return mongoose[property];
    }

  }
});
