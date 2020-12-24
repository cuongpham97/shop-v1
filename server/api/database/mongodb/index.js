const connect = require('./connect');
const { Mongoose } = require('mongoose');
const mongoose = new Mongoose;

// Connect to database
connect(mongoose);

// Plugins
const timestamp = require('./plugins/timestamp.plugin');
const formatValidateErrorPlugin = require('./plugins/format_validate_error.plugin');

mongoose.plugin(timestamp);
mongoose.plugin(formatValidateErrorPlugin);

// Models
const userModel = require('./models/user.model');

userModel.apply(mongoose);

module.exports = mongoose;
