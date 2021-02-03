const cron = require('./cron');

async function init() {
  cron.run();
}

module.exports = { init };
