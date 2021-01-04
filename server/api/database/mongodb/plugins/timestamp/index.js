const moment = require('moment');

function timestampPlugin(schema, options) {

  schema.set('timestamps', {
    createdAt: true,
    updatedAt: { setOnInsert: false },
    currentTime: () => moment().format()
  });

}

module.exports = timestampPlugin;
