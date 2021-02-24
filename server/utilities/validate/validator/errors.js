function Errors() {
  this.errors = {};
  this.errorsCount = 0;
}

Errors.prototype = {
  constructor: Errors,

  setError(attribute, error) {
    this.errors[attribute] = error;
    ++this.errorsCount;
  },

  keys: function () {
    return Object.keys(this.errors);
  },

  toArray: function () {
    return Object.entries(this.errors).map(error => error[1]);
  }
}

module.exports = Errors;
