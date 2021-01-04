const moment = require('moment');
const { StatusCodes } = require('http-status-codes');
const logger = require('../../../utilities/logger'); 
const config = require('../../../config');

class ErrorFilter {
  catch(error, req, res, next) {

    if(config.ENVIROMENT === 'DEVELOPMENT') {
      logger.error(error);
    }

    //TODO: report error or save to database

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'UncaughtException',
      message: 'Something went wrong, an error has occurred',
      timestamp: moment().format('HH:mm:ss DD-MM-yyyy')
    });
  }
}

module.exports = ErrorFilter;
