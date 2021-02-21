class ExceptionFilter {
  
  catch(error, _req, res, _next) {
    return res.status(error.httpStatus).json({
      error: error.name,
      code: error.code,
      message: error.message,
      timestamp: error.timestamp
    });
  }
}

module.exports = ExceptionFilter;
