const Validator = require('validatorjs');
const _ = require('lodash');
const registerAsync = Validator.registerAsync;

/**
 * Override Validator.registerAsync
 */
Validator.registerAsync = function (name, fn, msg) {
  return registerAsync(name, wrap(fn), msg);
}

function wrap(fn) {
  return function(originValue, args, attribute, pass) {

    const name = this.name;
    const input = this.validator.input;
    const value = _.get(input, attribute);
    const messages = this.validator.messages;
    const formatter = this.validator.messages.attributeFormatter;

    const message = messages.customMessages[name] 
      || messages.messages[name] 
      || messages.customMessages['def'] 
      || messages.messages['def'];

    const moreInfo = {
      name: name,
      input: input,
      originValue: originValue,
      message: message
    }

    const done = (result = true, msg = null, args = {}) => {
      switch (true) {
        case result:
          return pass(true);

        case msg:
          return pass(false, msg);
      }

      if (typeof message === 'object') {
        let type = typeof value === 'string' ? 'string' : 'numeric';
        msg = message[type];       
      
      } else {
        msg = message;
      }

      msg = msg.replace(':attribute', formatter(attribute));

      for (const [key, value] of Object.entries(args)) {
        msg = msg.replace(`:${key}`, value);
      }

      return pass(false, msg);
    }

    fn.call(moreInfo, attribute, value, args, done);
  }
}
