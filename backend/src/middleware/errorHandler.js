/**
 * Global Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)

  // Default error
  let error = {
    success: false,
    error: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  }

  let statusCode = err.statusCode || 500

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message)
    error.error = messages.join(', ')
    statusCode = 400
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    error.error = `${field} already exists`
    statusCode = 409
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    error.error = 'Resource not found'
    statusCode = 404
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.error = 'Invalid token'
    statusCode = 401
  }

  if (err.name === 'TokenExpiredError') {
    error.error = 'Token expired'
    statusCode = 401
  }

  res.status(statusCode).json(error)
}
