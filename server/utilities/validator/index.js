const Validator = require('validatorjs');
const rules = require('./rules');

Validator.setMessages('en', require('./lang/en.json'));

module.exports = function (input, rules, customMessages, validator = Validator) {

  const validation = new validator(input, rules, customMessages);

  return new Promise(resolve => validation.checkAsync( 
    () => resolve({ result: input, errors: null }),
    () => {        

      let errors = [];
        
      for (const [field, error] of Object.entries(validation.errors.all())) {
        errors.push(error[0]);
      }

      return resolve({ result: null, errors: errors });
    }
  ));
}

exports.Validator = Validator;
