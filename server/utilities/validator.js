const Validator = require('validatorjs');

// Create new validate rules

// object
Validator.register('object', function (value, args, attribute) {
  return typeof value === 'object' && value !== null;
}, ':attribute must be an object');

module.exports = async function (input, rules, customMessages, validator) {

  validator = validator || Validator;
  let validation = new validator(input, rules, customMessages);

  return new Promise((resolve, reject) => {

    validation.checkAsync( 
      function () {
        return resolve({ result: input, errors: null });
      },
      function () {        
        let errors = [];
        
        for (const [field, error] of Object.entries(validation.errors.all())) {
          errors.push(error[0]);
        }

        return resolve({ result: null, errors: errors });
      }
    );
  });
}
