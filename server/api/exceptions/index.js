const Exception = require('./classes/exception.class');
const ValidationException = require('./classes/validation.class');
const AuthenticationException = require('./classes/authentication.class');
const AuthorizationException = require('./classes/authorization.class');

const ExceptionFilter = require('./filters/exception.filter');
const ErrorFilter = require('./filters/error.filter');

const registerFilters = new Map([
  // [ ValidationException, ValidateExceptionFilter ]
]);

async function exceptionHandler(error, req, res, next) {
  if (!error) return next();

  // Handle errors with registered filter
  for (let [exceptionType, filter] of registerFilters) {
    if (error.constructor === exceptionType) {
      return (new filter).catch(error, req, res, next);
    }
  }

  // Handle errors that inherit from Exception class
  if (error instanceof Exception) {
    return (new ExceptionFilter).catch(error, req, res, next);
  }

  // Handle uncaught errors
  return (new ErrorFilter).catch(error, req, res, next);
}

module.exports = { 
  Exception, 
  ValidationException,
  AuthenticationException,
  AuthorizationException,
  exceptionHandler 
};
