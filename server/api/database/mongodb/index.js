const connect = require('./connect');
const { Mongoose } = require('mongoose');
const mongoose = new Mongoose;

// Connect to database
connect(mongoose);

// Plugins
const pagination = require('./plugins/pagination.plugin');
const timestamp = require('./plugins/timestamp.plugin');
const formatValidateError = require('./plugins/format_validate_error.plugin');

mongoose.plugin(pagination);
mongoose.plugin(timestamp);
mongoose.plugin(formatValidateError);

// Models
const userModel = require('./models/user.model');

userModel.apply(mongoose);

module.exports = mongoose;
