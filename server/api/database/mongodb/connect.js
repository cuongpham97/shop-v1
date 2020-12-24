const mongoose = require('mongoose');
const config = require('../../../config');
const logger = require('../../../utilities/logger');

exports.connect = async (callback = null) => {

  //create connection
  mongoose.connect(
    config.database.mongodb.URI, 
    config.database.mongodb.Opts
  );

  //connect success
  mongoose.connection.on('connected', function () {
    logger.info('Mongoose connected to MongoDB');
  });

  //has error
  mongoose.connection.on('error', function (err) {
    logger.error('Mongoose connection error:');
    logger.nomarl(err);
    process.exit(0);
  });

  //disconnected
  mongoose.connection.on('disconnected', function () {
    logger.warn('Mongoose disconnected');
  });

  //open connection
  mongoose.connection.once('open', function () {
    if (callback && typeof (callback) === 'function') {
      callback();
    }
  });

  //process ends, close the connection
  process.on('SIGINT', function () {
    mongoose.connection.close(function () {
      logger.warn('Mongoose disconnected through app termination');
      process.exit(0);
    });
  });
};
