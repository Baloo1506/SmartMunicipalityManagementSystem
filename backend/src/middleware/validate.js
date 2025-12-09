/**
 * Validation Middleware
 * Express-validator helpers
 */
import { body, param, query, validationResult } from 'express-validator'

/**
 * Handle validation errors
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(e => ({
        field: e.path,
        message: e.msg
      }))
    })
  }
  next()
}

/**
 * Common validation rules
 */
export const validators = {
  // Auth validators
  register: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/\d/)
      .withMessage('Password must contain a number'),
    body('firstName').trim().notEmpty().withMessage('First name required'),
    body('lastName').trim().notEmpty().withMessage('Last name required'),
    validate
  ],

  login: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
    validate
  ],

  // Post validators
  createPost: [
    body('title').trim().notEmpty().isLength({ max: 200 }).withMessage('Title required (max 200 chars)'),
    body('content').trim().notEmpty().isLength({ max: 10000 }).withMessage('Content required'),
    body('category').isIn(['news', 'announcement', 'discussion', 'alert', 'event']).withMessage('Valid category required'),
    validate
  ],

  updatePost: [
    body('title').optional().trim().isLength({ max: 200 }),
    body('content').optional().trim().isLength({ max: 10000 }),
    body('category').optional().isIn(['news', 'announcement', 'discussion', 'alert', 'event']),
    validate
  ],

  // Comment validators
  createComment: [
    body('content').trim().notEmpty().isLength({ max: 2000 }).withMessage('Comment required (max 2000 chars)'),
    validate
  ],

  // Event validators
  createEvent: [
    body('title').trim().notEmpty().isLength({ max: 200 }).withMessage('Title required'),
    body('description').trim().notEmpty().withMessage('Description required'),
    body('category').isIn(['community', 'sports', 'culture', 'education', 'health', 'government', 'environment', 'other']).withMessage('Valid category required'),
    body('startDate').isISO8601().withMessage('Valid start date required'),
    body('endDate').isISO8601().withMessage('Valid end date required'),
    body('location.name').trim().notEmpty().withMessage('Location name required'),
    validate
  ],

  // Report validators
  createReport: [
    body('contentType').isIn(['post', 'comment', 'event', 'user']).withMessage('Valid content type required'),
    body('contentId').isMongoId().withMessage('Valid content ID required'),
    body('reason').isIn(['spam', 'harassment', 'hate_speech', 'misinformation', 'inappropriate', 'copyright', 'privacy_violation', 'other']).withMessage('Valid reason required'),
    validate
  ],

  // Pagination
  pagination: [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    validate
  ],

  // ObjectId param
  objectId: [
    param('id').isMongoId().withMessage('Invalid ID format'),
    validate
  ]
}
