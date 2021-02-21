const moment = require('moment');
const { StatusCodes } = require('http-status-codes');

exports.Exception = class extends Error {
  constructor(args) {
    super();
    Error.captureStackTrace(this, this.constructor);
    
    this.httpStatus = args.httpStatus;
    this.name = args.name;
    this.code = args.code;
    this.message = args.message;
    this.timestamp = moment().format('HH:mm:ss DD-MM-yyyy');
  }
}

exports.NotFoundException = class extends this.Exception {
  constructor(args) {
    super(
      Object.assign({
        httpStatus: StatusCodes.NOT_FOUND,
        name: 'NotFoundException',
        code: 'RESOURCE_NOT_FOUND'
      }, args)
    );
  }
}

exports.ValidationException = class extends this.Exception {
  constructor(args) {
    super(
      Object.assign({
        httpStatus: StatusCodes.UNPROCESSABLE_ENTITY,
        name: 'ValidationException',
        code: 'WRONG_INPUT'
      }, args)
    );
  }
}

exports.AuthenticationException = class extends this.Exception {
  constructor(args) {
    super(
      Object.assign({
        httpStatus: StatusCodes.UNAUTHORIZED,
        name: 'AuthenticationException',
        code: 'UNAUTHENTICATED'
      }, args)
    );
  }
}

exports.AuthorizationException = class extends this.Exception {
  constructor(args) {
    super(
      Object.assign({
        httpStatus: StatusCodes.UNAUTHORIZED,
        name: 'AuthorizationException',
        code: 'UNAUTHORIZED'
      }, args)
    );
  }
}

exports.BadRequestException = class extends this.Exception {
  constructor(args) {
    super(
      Object.assign({
        httpStatus: StatusCodes.BAD_REQUEST,
        name: 'BadRequestException',
        code: 'UNACCEPTED_REQUEST'
      }, args)
    );
  }
}
