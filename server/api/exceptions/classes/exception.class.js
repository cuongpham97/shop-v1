const moment = require('moment');
const { StatusCodes } = require('http-status-codes');

exports.Exception = class extends Error {
  constructor(args) {
    super();
    Error.captureStackTrace(this, this.constructor);
    
    this.message = args.message;
    this.name = args.name;
    this.httpStatus = args.httpStatus;
    this.timestamp = moment().format('HH:mm:ss DD-MM-yyyy');
  }
}

exports.NotFoundException = class extends this.Exception {
  constructor(args) {
    super(
      Object.assign({
        name: 'NotFoundException',
        httpStatus: StatusCodes.NOT_FOUND
      }, args)
    );
  }
}

exports.ValidationException = class extends this.Exception {
  constructor(args) {
    super(
      Object.assign({
        name: 'ValidationException',
        httpStatus: StatusCodes.UNPROCESSABLE_ENTITY
      }, args)
    );
  }
}

exports.AuthenticationException = class extends this.Exception {
  constructor(args) {
    super(
      Object.assign({
        name: 'AuthenticationException',
        httpStatus: StatusCodes.UNAUTHORIZED
      }, args)
    );
  }
}

exports.AuthorizationException = class extends this.Exception {
  constructor(args) {
    super(
      Object.assign({
        name: 'AuthorizationException',
        httpStatus: StatusCodes.UNAUTHORIZED
      }, args)
    );
  }
}

exports.BadRequestException = class extends this.Exception {
  constructor(args) {
    super(
      Object.assign({
        name: 'BadRequestException',
        httpStatus: StatusCodes.BAD_REQUEST
      }, args)
    );
  }
}
