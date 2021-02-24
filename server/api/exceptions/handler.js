const moment = require('moment');

const ExceptionFilter = require('./filters/exception.filter');
const ErrorFilter = require('./filters/error.filter');

const registerFilters = new Map([]);

function _findFilter(error, register) {

  for (const [eClass, filter] of register) {
    if (error.constructor === eClass) {
      return filter;
    }
  }

  if (error instanceof Exception) {
    return ExceptionFilter;
  }

  return ErrorFilter;
}

module.exports = async function (error, req, res, next) {
  if (!error) return next();

  const filter = _findFilter(error, registerFilters);
  const result = (new filter).catch(error, req, res);

  return res.status(result.httpStatus).json({
    error: result.name,
    code: result.code,
    message: result.message,
    timestamp: moment().format('HH:mm:ss DD-MM-yyyy')
  });
}
