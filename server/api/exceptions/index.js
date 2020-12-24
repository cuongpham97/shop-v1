const Exception = require('./classes/exception.class');
const ValidationException = require('./classes/validation_exception.class');

const ValidationExceptionFilter = require('./filters/validation_exception.filter');
const ExceptionFilter = require('./filters/exception.filter');
const ErrorFilter = require('./filters/error.filter');

const registerFilters = new Map([
  [ ValidationException, ValidationExceptionFilter ],
  [ Exception, ExceptionFilter ],
  [ null, ErrorFilter ]
]);

async function exceptionHandler(error, req, res, next) {
  if (!error) return next();

  for (let [exceptionType, filter]  of registerFilters) {

    if (error.constructor === exceptionType) {
      (new filter).catch(error, req, res, next);
      break;
    }

    if (exceptionType === null) {
      (new ErrorFilter).catch(error, req, res, next);
      break;
    }
  }
}

module.exports = { 
  Exception, 
  ValidationException,
  exceptionHandler 
};
