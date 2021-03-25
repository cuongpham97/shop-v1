const rules = require('./rules');
const Context = require('./context');
const Messages = require('./messages');
const Errors = require('./errors');

function Validator(input, rules, customMessages) {
  this.input = _.cloneDeep(input);
  this.rules = this._flatten(rules);
  this.messages = this._createMessages(customMessages);
  this.errors = this._createErrors();
}

Validator.prototype = {
  constructor: Validator,
  
  check: async function () {
    await this._parseRulesAndCheck();
    return this._prepareValidateResult();
  },

  _createMessages: function (customMessages) {
    return new Messages(customMessages);
  },

  _createErrors: function () {
    return new Errors;
  },

  _flatten: function (o) {
    const result = {};
  
    function recursive(o, path) {
      for (const [key, value] of Object.entries(o)) {
        let currentPath = path ? `${path}.${key}` : key;
  
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          recursive(value, currentPath); 
        }else {
          result[currentPath] = value;
        }
      }
    }

    recursive(o, null);
    return result;
  },
  
  _parseRulesAndCheck: async function () {
    for (const [attribute, attributeRules] of Object.entries(this.rules)) {
      const parsedRules = {};
      this._parseRules(attribute, attributeRules, parsedRules);

      for (const [attr, rulesArray] of Object.entries(parsedRules)) {
        const context = new Context(this.input, attr, rulesArray);
        await this._validateAttribute(attr, rulesArray, context);
      }
    }
  },

  _parseRules: function (attribute, attributeRules, parsedRules) {
    if (attribute.indexOf('*') > -1) {
      this._parseRulesRecurse(attribute, attributeRules, parsedRules);

    } else {
      parsedRules[attribute] = this._prepareRulesArray(attributeRules);
    }
  },

  _parseRulesRecurse: function (attribute, attributeRules, parsedRules) {
    const parentPath = attribute.substr(0, attribute.indexOf('*') - 1);
    const propertyValue = _.get(this.input, parentPath);

    if (typeof propertyValue === 'object' && propertyValue !== null) {
      for (const key in propertyValue) {
        this._parseRules(attribute.replace('*', key), attributeRules, parsedRules);
      }
    }
  },

  _prepareRulesArray: function (attributeRules){
    let rulesArray = Array.isArray(attributeRules)
      ? attributeRules
      : attributeRules.split('|');

    return this._extractRuleAndRuleValue(rulesArray);
  },

  _extractRuleAndRuleValue: function (rulesArray) {
    return rulesArray.map(rule => {
      if (typeof rule === 'string') {
        const rulesArray = rule.split(':');

        return {
          name: rulesArray[0],
          value: rulesArray.slice(1).join(':')
        }
      }

      if (Array.isArray(rule)) {
        return { name: rule[0], value: rule[1] };
      }
      
      if (typeof rule === 'function') {
        return { name: 'custom', value: rule };
      }
    });
  },

  _validateAttribute: async function (attribute, rulesArray, context) {
    const self = this;

    for (const rule of rulesArray) {
      if (context.stopValidating) break;
      
      const inputValue = _.get(this.input, attribute);
      context.setCurrentRule(rule);

      await new Promise(function (resolve) {
        function done(isValid = true, message = null, msgArgs = null) {
          if (!isValid) {
            context.stopValidating = true;
            self._setError(attribute, rule.name, message, msgArgs);
          }
           
          return resolve();
        }
    
        const func = rule.name === 'custom' ? rule.value : rules.getRule(rule.name); 
        return func.call(context, attribute, inputValue, rule.value, done);
      });
    }
  },

  _setError: function (attribute, ruleName, message, msgArgs) {
    message = message || this.messages.getMessage(ruleName);
    if (!message) {
      throw new Error(`Validator \`${ruleName}\` message is not defined!`)
    }

    if (typeof message === 'object') {
      const type = typeof _.get(this.input, attribute) === 'string' ? 'string' : 'numeric';
      message = message[type];
    }

    message = message.replace(/:attribute/g, attribute);

    for (const [key, value] of Object.entries(msgArgs || {})) {
      message = message.replace(new RegExp(`:${key}`, 'g'), value);
    }

    this.errors.setError(attribute, message);
  },

  _prepareValidateResult: function () {
    return this.errors.errorsCount
      ? { result: null, errors: this.errors }
      : { result: this.input, errors: null };
  }
};

Validator.register = function (ruleName, fn, message) {
  if (message) {
    Messages.setMessage(ruleName, message);
  }

  rules.register(ruleName, fn);
}

module.exports = Validator;
