function Context(input, attribute, rulesArray) {
  this.input = input;
  this.attribute = attribute;
  this.rulesArray = rulesArray;
  this.stopValidating = false;
}

Context.prototype = {
  constructor: Context,

  setCurrentRule: function (rule) {
    this.currentRule = rule;
  },

  hasRule: function (ruleName) {
    return this.rulesArray.find(rule => rule.name == ruleName) !== undefined;
  },

  isPresent: function () {
    return _.has(this.input, this.attribute);
  },

  passedNullable: function () {
    return _.get(this.input, this.attribute) === null && this.hasRule('nullable');
  },

  hasInputAttribute: function (attribute) {
    return _.has(this.input, attribute);
  },

  getInputAttribute: function (attribute) {
    return _.get(this.input, attribute)
  },

  setInputAttribute: function (attribute, value) {
    _.set(this.input, attribute, value);
  }
}

module.exports = Context;
