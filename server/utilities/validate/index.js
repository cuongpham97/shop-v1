const Validator = require('./validator');

module.exports = async function (value, rule, customMessages, validator) {

  validator = validator || new Validator(value, rule, customMessages);
  return await validator.check();
}

exports.Validator = Validator;
