const { StatusCodes } = require('http-status-codes');
const report = require('~utils/report'); 

class ErrorFilter {
  catch(error) {

    if (error instanceof SyntaxError && 'body' in error && error.status === 400) {
      return {
        httpStatus: StatusCodes.BAD_REQUEST,
        name: 'BadRequestException',
        code: 'WRONG_JSON_FORMAT',
        message: error.message
      };
    }

    report.error(error);

    return {
      httpStatus: StatusCodes.INTERNAL_SERVER_ERROR,
      name: 'UncaughtException',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong, an error has occurred'
    };
  }
}

module.exports = ErrorFilter;
