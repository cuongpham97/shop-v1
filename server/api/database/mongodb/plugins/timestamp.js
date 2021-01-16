const moment = require('moment');

function timestampPlugin(schema, _options) {

  schema.set('timestamps', {
    createdAt: true,
    updatedAt: true,
    currentTime: () => moment().format()
  });

}

module.exports = timestampPlugin;
