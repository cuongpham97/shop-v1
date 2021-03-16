const logger = require('~utils/logger');

['APP_PORT'].forEach(params => {
  if (!process.env[params]) {
    logger.error('Missing enviroment params: ' + params);
    process.exit(0);
  }
});

module.exports = {
  LISTEN_PORT: process.env.PORT || process.env.APP_PORT
};
