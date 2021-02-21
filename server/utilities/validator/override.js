const Validator = require('validatorjs');
const registerAsync = Validator.registerAsync;
const registerAsyncImplicit = Validator.registerAsyncImplicit;

function enhance(validateFunc) {

  return function (_value, args, attribute, passes) {

    const ruleName = this.name;
    const input = this.validator.input;
    const value = _.get(input, attribute);
    const messages = this.validator.messages;

    const message = messages.customMessages[ruleName] 
      || messages.messages[ruleName] 
      || messages.customMessages['def'] 
      || messages.messages['def'];

    const self = { input, message };

    const done = function (isValid = true, message = null, msgArgs = null) {

      if (isValid) return passes(true);
      
      if (!message) {
        message = typeof self.message === 'object'
          ? self.message[typeof value === 'string' ? 'string' : 'numeric']
          : self.message;
      }

      message = message.replace(':attribute', messages.attributeFormatter(attribute));

      for (const [key, value] of Object.entries(msgArgs || {})) {
        message = message.replace(`:${key}`, value);
      }

      return passes(false, message);
    }

    return validateFunc.call(self, attribute, value, args, done);
  }
}

Validator.registerAsync = function (ruleName, callback) {
  return registerAsync(ruleName, enhance(callback));
}

Validator.registerAsyncImplicit = function (ruleName, callback) {
  return registerAsyncImplicit(ruleName, enhance(callback));
}
