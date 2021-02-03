const { CronJob } = require('cron');

async function expiredCart() {
  
}

exports.run = function () {
  return new CronJob('00 00 1 * * 0-6', expiredCart, null, true);
}
