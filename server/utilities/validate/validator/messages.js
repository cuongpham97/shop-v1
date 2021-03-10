function _loadMessage(lang) {
  return require(`./lang/${lang}.json`);
}

function Messages(customMessages) {
  this.customMessages = {...Messages.customMessages, ...customMessages };
  this.messages = _loadMessage(Messages.defaultLang);
}

Messages.defaultLang = 'en';

Messages.customMessages = {};

Messages.setMessage = function (ruleName, message) {
  Messages.customMessages[ruleName] = message;
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
