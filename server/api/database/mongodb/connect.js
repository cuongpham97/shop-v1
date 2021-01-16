const config = require('~config');
const logger = require('~utils/logger');

module.exports = (mongoose, callback = null) => {

  // Create connection
  mongoose.connect(
    config.database.mongodb.URI, 
    config.database.mongodb.OPTIONS
  );

  // Connect success
  mongoose.connection.on('connected', function () {
    logger.info('Mongoose connected to MongoDB');
  });

  // Has error
  mongoose.connection.on('error', function (err) {
    logger.error('Mongoose connection error:');
    logger.nomarl(err);
    process.exit(0);
  });

  // Disconnected
  mongoose.connection.on('disconnected', function () {
    logger.warn('Mongoose disconnected');
  });

  // Open connection
  mongoose.connection.once('open', function () {
    if (callback && typeof (callback) === 'function') {
      callback();
    }
  });

  // Process ends, close the connection
  process.on('SIGINT', function () {
    mongoose.connection.close(function () {
      logger.warn('Mongoose disconnected through app termination');
      process.exit(0);
    });
  });
};
