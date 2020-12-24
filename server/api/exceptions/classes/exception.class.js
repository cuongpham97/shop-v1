const moment = require('moment');

class Exception extends Error {
  constructor(args) {
    super();
    Error.captureStackTrace(this, this.constructor);
    
    this.message = args.message;
    this.name = args.name;
    this.httpStatus = args.httpStatus;
    this.timestamp = moment().format('HH:mm:ss DD-MM-yyyy');
  }
}

module.exports = Exception;
