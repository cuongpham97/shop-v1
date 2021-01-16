const logger = require('~utils/logger');

['DB_MONGODB_URI'].forEach(params => {
  if (!process.env[params]) {
    logger.error('Missing enviroment params: ' + params);
    process.exit(0);
  }
});

module.exports = {
  mongodb: {
    URI: process.env.DB_MONGODB_URI,
    OPTIONS: {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false
    }
  }
};
