const Validator = require('validatorjs');
require('./override');
require('./rules');

Validator.setMessages('en', require('./lang/en.json'));

module.exports = function (input, rules, customMessages, validator = Validator) {

  const validation = new validator(input, rules, customMessages);

  return new Promise(function (resolve) {

    const passes = function () {
      return resolve({ result: input, errors: null });
    }
  
    const fails = function () {
      const errors = [];
  
      for (const [, error] of Object.entries(validation.errors.all())) {
        errors.push(error[0]);
      }
  
      return resolve({ result: null, errors: errors });
    }

    return validation.checkAsync(passes, fails);
  });
}

exports.Validator = Validator;
