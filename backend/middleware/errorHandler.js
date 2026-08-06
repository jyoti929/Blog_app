/**
 * ==========================================================================
 * ERROR HANDLING MIDDLEWARE (middleware/errorHandler.js)
 * Global Express Error & 404 Route Not Found Handlers
 * ==========================================================================
 */

/**
 * Middleware for 404 Route Not Found
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global Custom Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  // If status code is 200, default to 500 Server Error
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
