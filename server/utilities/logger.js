const colors = require('colors/safe');

colors.setTheme({
  info: 'green',
  error: 'red',
  warn: 'yellow',
  help: 'grey',
  nomarl: 'white'
});

const logger = {
  log: function (type) {
    return (...message) => console.log(
      colors[type](message.reduce(
        (total, item) => total += (typeof item === 'string')
          ? item
          : JSON.stringify(item, null, 2)
      ))
    );
  }
}

module.exports = new Proxy(logger, {
  get: function (target, prop) {
    return target.log(prop);
  }
});
