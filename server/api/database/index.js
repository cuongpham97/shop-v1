const mongodb = require('./mongodb');

async function init() {
  await mongodb.init();
}

module.exports = { init, mongodb };
