const rules = require('./rules');
const Context = require('./context');
const Messages = require('./messages');
const Errors = require('./errors');

function Validator(input, rules, customMessages) {
  this.input = _.cloneDeep(input);
  this.rules = this._parseRules(rules);
  this.messages = this. _createMessages(customMessages);
  this.errors = this._createErrors();
}

Validator.prototype = {

  constructor: Validator,
  
  check: async function () {

    for (const [attribute, rulesArray] of Object.entries(this.rules)) {

      const context = new Context(this.input, attribute, rulesArray);

      for (const rule of rulesArray) {

        if (context.stopValidating) break;

        const self = this;
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
    }

    return this._prepareValidateResult();
  },

  _prepareValidateResult: function () {
    return this.errors.errorsCount
      ? { result: null, errors: this.errors }
      : { result: this.input, errors: null };
  },

  _createMessages: function (customMessages) {
    return new Messages(customMessages);
  },

  _createErrors: function () {
    return new Errors;
  },

  _setError: function (attribute, ruleName, message, msgArgs) {
    
    message = message || this.messages.getMessage(ruleName);
   
    if (!message) {
      throw new Error('Validator `' + ruleName + '` message is not defined!')
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

  _flatten: function (o) {
    const result = {};
  
    function recursive(o, path) {
      for (const [key, value] of Object.entries(o)) {
        
        let currentPath = path ? `${path}.${key}` : key;
  
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          recursive(value, currentPath); 
        }
        else {
          result[currentPath] = value;
        }
      }
    }

    recursive(o, null);

    return result;
  },
  
  _parseRules: function (rules) {

    const parsedRules = {};
  
    rules = this._flatten(rules);
  
    for (const [attribute, attributeRules] of Object.entries(rules)) {
      this._parseRulesCheck(attribute, attributeRules, parsedRules);
    }
  
    return parsedRules;
  },

  _parseRulesCheck: function (attribute, attributeRules, parsedRules) {
 
    if (attribute.indexOf('*') > -1) {
      this._parsedRulesRecurse(attribute, attributeRules, parsedRules);
    } else {
      parsedRules[attribute] = this._prepareRulesArray(attributeRules);
    }
  },

  _parsedRulesRecurse: function (attribute, attributeRules, parsedRules) {
    const parentPath = attribute.substr(0, attribute.indexOf('*') - 1);
    const propertyValue = _.get(this.input, parentPath);
  
    if (typeof propertyValue === 'object' && propertyValue !== null) {
      
      for (const key in propertyValue) {
        this._parseRulesCheck(attribute.replace('*', key), attributeRules, parsedRules);
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
  }
};

module.exports = Validator;
