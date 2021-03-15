const { CronJob } = require('cron');
const logger = require('~utils/logger');
const { mongodb } = require('~database');
const moment = require('moment');

async function _expiredCart() {
  logger.info('[CronJob] starting `return products from expired carts`');
  
  const before2day = moment().subtract(2, 'days').format();
  const cursor = mongodb.model('cart').find({ "updatedAt": { "$lt": before2day } }).cursor();

  for await (const cart of cursor) {
    for (const item of cart.items) {
      const { product, sku, quantity } = item;

      await mongodb.model('product').updateOne(
        { "_id": product, "skus._id": sku },
        { "$inc": { "skus.$.quantity": quantity } }
      );
    }

    await cart.set('items', []).save();
  }

  logger.info('[CronJob] `return products from expired carts` completed');
}

exports.run = function () {
  return new CronJob('00 00 1 * * 0-6', _expiredCart, null, true);
}
