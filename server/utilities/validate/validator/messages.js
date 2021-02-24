const en = require('./lang/en.json');

function Messages(customMessages) {
  this.lang = 'en';
  this.customMessages = customMessages || {}
  this.messages = en;
}

Messages.prototype = {
  constructor: Messages,

  getMessage: function (ruleName) {
    return this.customMessages[ruleName]
      || this.customMessages['def']
      || this.messages[ruleName]
      || this.messages['def'];
  }
}

module.exports = Messages;
