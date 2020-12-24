const Exception = require("./exception.class");
const { StatusCodes } = require('http-status-codes');

class AuthenticationException extends Exception {
  constructor(args) {
    super(
      Object.assign({
        name: 'AuthenticationException',
        httpStatus: StatusCodes.UNAUTHORIZED
      }, args)
    );
  }
}

module.exports = AuthenticationException;
