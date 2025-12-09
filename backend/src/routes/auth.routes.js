/**
 * Auth Routes
 * /api/auth
 */
import { Router } from 'express'
import AuthService from '../services/AuthService.js'
import { protect } from '../middleware/auth.js'
import { validators } from '../middleware/validate.js'

const router = Router()

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', validators.register, async (req, res, next) => {
  try {
    const result = await AuthService.register(req.body)
    res.status(201).json({
      success: true,
      data: result
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', validators.login, async (req, res, next) => {
  try {
    const { email, password } = req.body
    const result = await AuthService.login(email, password)
    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    error.statusCode = 401
    next(error)
  }
})

/**
 * POST /api/auth/verify-email/:token
 * Verify email address
 */
router.post('/verify-email/:token', async (req, res, next) => {
  try {
    const user = await AuthService.verifyEmail(req.params.token)
    res.json({
      success: true,
      message: 'Email verified successfully',
      data: user
    })
  } catch (error) {
    error.statusCode = 400
    next(error)
  }
})

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password', async (req, res, next) => {
  try {
    const result = await AuthService.requestPasswordReset(req.body.email)
    res.json({
      success: true,
      message: 'If email exists, reset instructions have been sent'
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/auth/reset-password/:token
 * Reset password with token
 */
router.post('/reset-password/:token', async (req, res, next) => {
  try {
    const result = await AuthService.resetPassword(req.params.token, req.body.password)
    res.json({
      success: true,
      message: result.message
    })
  } catch (error) {
    error.statusCode = 400
    next(error)
  }
})

/**
 * POST /api/auth/change-password
 * Change password (authenticated)
 */
router.post('/change-password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    const result = await AuthService.changePassword(req.user._id, currentPassword, newPassword)
    res.json({
      success: true,
      message: result.message
    })
  } catch (error) {
    error.statusCode = 400
    next(error)
  }
})

/**
 * GET /api/auth/me
 * Get current user
 */
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    data: req.user
  })
})

export default router
