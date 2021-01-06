const connect = require('./connect');
const { Mongoose } = require('mongoose');
const mongoose = new Mongoose;

// Models
const userModel = require('./models/user.model');

// Plugins
const pagination = require('./plugins/pagination');
const timestamp = require('./plugins/timestamp');
const formatValidateError = require('./plugins/format_validate_error');

const models = [userModel];
const plugins = [timestamp, pagination, formatValidateError];

module.exports = (function () {

  // Connect to database
  connect(mongoose);

  // Use plugins
  models.forEach(model => {
    plugins.forEach(plugin => model.schema && model.schema.plugin(plugin));
  });

  // Use models
  models.forEach(model => model.apply(mongoose));

  return mongoose;
})();
