const logger = require('../utilities/logger');

['APP_ENV'].forEach(params => {
  if (!process.env[params]) {
    logger.error('Missing enviroment params: ' + params);
    process.exit(0);
  }
});

module.exports = {
  ENVIRONMENT: process.env.APP_ENV
};
