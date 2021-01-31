const moment = require('moment');
const { StatusCodes } = require('http-status-codes');
const report = require('~utils/report'); 
const config = require('~config');

class ErrorFilter {
  catch(error, _req, res, _next) {

    if(config.ENVIRONMENT === 'DEVELOPMENT') {
      report.error(error);
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'UncaughtException',
      message: 'Something went wrong, an error has occurred',
      timestamp: moment().format('HH:mm:ss DD-MM-yyyy')
    });
  }
}

module.exports = ErrorFilter;
