const Exception = require("./exception.class");
const { StatusCodes } = require('http-status-codes');

class ValidationException extends Exception {
  constructor(args) {
    super(
      Object.assign({
        name: 'ValidationException',
        httpStatus: StatusCodes.UNPROCESSABLE_ENTITY
      }, args)
    );
  }
}

module.exports = ValidationException;
