/**
 * 404 Not Found Middleware
 */
export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  })
}
