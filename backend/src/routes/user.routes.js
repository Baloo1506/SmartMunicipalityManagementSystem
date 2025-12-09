/**
 * User Routes
 * /api/users
 */
import { Router } from 'express'
import UserService from '../services/UserService.js'
import { protect, isAdmin } from '../middleware/auth.js'
import { validators } from '../middleware/validate.js'

const router = Router()

/**
 * GET /api/users/profile
 * Get current user's profile
 */
router.get('/profile', protect, async (req, res, next) => {
  try {
    const user = await UserService.getProfile(req.user._id)
    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
})

/**
 * PUT /api/users/profile
 * Update current user's profile
 */
router.put('/profile', protect, async (req, res, next) => {
  try {
    const user = await UserService.updateProfile(req.user._id, req.body)
    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
})

/**
 * PUT /api/users/notifications
 * Update notification preferences
 */
router.put('/notifications', protect, async (req, res, next) => {
  try {
    const preferences = await UserService.updateNotificationPreferences(req.user._id, req.body)
    res.json({
      success: true,
      data: preferences
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/users/subscriptions
 * Get user's subscriptions
 */
router.get('/subscriptions', protect, async (req, res, next) => {
  try {
    const subscriptions = await UserService.getSubscriptions(req.user._id)
    res.json({
      success: true,
      data: subscriptions
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/users/subscriptions
 * Add subscription
 */
router.post('/subscriptions', protect, async (req, res, next) => {
  try {
    const subscriptions = await UserService.addSubscription(req.user._id, req.body)
    res.json({
      success: true,
      data: subscriptions
    })
  } catch (error) {
    next(error)
  }
})

/**
 * DELETE /api/users/subscriptions/:id
 * Remove subscription
 */
router.delete('/subscriptions/:id', protect, async (req, res, next) => {
  try {
    const subscriptions = await UserService.removeSubscription(req.user._id, req.params.id)
    res.json({
      success: true,
      data: subscriptions
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/users/deactivate
 * Deactivate account
 */
router.post('/deactivate', protect, async (req, res, next) => {
  try {
    const result = await UserService.deactivateAccount(req.user._id)
    res.json({
      success: true,
      message: result.message
    })
  } catch (error) {
    next(error)
  }
})

/**
 * DELETE /api/users/account
 * Delete account (GDPR)
 */
router.delete('/account', protect, async (req, res, next) => {
  try {
    const result = await UserService.deleteAccount(req.user._id)
    res.json({
      success: true,
      message: result.message
    })
  } catch (error) {
    next(error)
  }
})

// Admin routes
/**
 * GET /api/users
 * Get all users (admin)
 */
router.get('/', protect, isAdmin, validators.pagination, async (req, res, next) => {
  try {
    const { query, page, limit, role, isActive } = req.query
    const result = await UserService.searchUsers(query, { page, limit, role, isActive })
    res.json({
      success: true,
      ...result
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/users/:id
 * Get user by ID (admin)
 */
router.get('/:id', protect, isAdmin, validators.objectId, async (req, res, next) => {
  try {
    const user = await UserService.getUserById(req.params.id)
    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
})

/**
 * PUT /api/users/:id/role
 * Update user role (admin)
 */
router.put('/:id/role', protect, isAdmin, validators.objectId, async (req, res, next) => {
  try {
    const user = await UserService.updateUserRole(req.params.id, req.body.role)
    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
})

export default router
