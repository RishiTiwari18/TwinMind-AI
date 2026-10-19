function errorHandler(err, req, res, next) {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || 500;

  if (err.type === "entity.parse.failed") {
    statusCode = 400;
  }

  const message =
    statusCode === 500
      ? "Internal server error"
      : statusCode === 400 && err.type === "entity.parse.failed"
        ? "Invalid JSON in request body"
        : err.message;

  res.status(statusCode).json({
    success: false,
    message
  });
}

module.exports = errorHandler;