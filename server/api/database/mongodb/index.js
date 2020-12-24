const mongoose = require('mongoose');

//plugin
const timestamp = require('mongoose-timestamp');
const formatValidateErrorPlugin = require('./plugins/format_validate_error.plugin');

mongoose.plugin(timestamp);
mongoose.plugin(formatValidateErrorPlugin);

//models
const userModel = require('./models/user.model');

module.exports = mongoose;
