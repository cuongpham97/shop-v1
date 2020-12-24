class ValidationExceptionFilter {
  
  catch(error, req, res, next) {
    return res.status(error.httpStatus).json({
      error: error.name,
      message: error.message,
      timestamp: error.timestamp
    });
  }
}

module.exports = ValidationExceptionFilter;
