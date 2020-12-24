const Exception = require("./exception.class");
const { StatusCodes } = require('http-status-codes');

class AuthorizationException extends Exception {
  constructor(args) {
    super(
      Object.assign({
        name: 'AuthorizationException',
        httpStatus: StatusCodes.UNAUTHORIZED
      }, args)
    );
  }
}

module.exports = AuthorizationException;
