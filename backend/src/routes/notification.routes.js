/**
 * Notification Routes
 * /api/notifications
 */
import { Router } from 'express'
import NotificationService from '../services/NotificationService.js'
import { protect } from '../middleware/auth.js'
import { validators } from '../middleware/validate.js'

const router = Router()

/**
 * GET /api/notifications
 * Get user's notifications
 */
router.get('/', protect, validators.pagination, async (req, res, next) => {
  try {
    const { page, limit, unreadOnly } = req.query
    const result = await NotificationService.getUserNotifications(
      req.user._id,
      { page, limit, unreadOnly: unreadOnly === 'true' }
    )
    res.json({
      success: true,
      ...result
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/notifications/unread-count
 * Get unread notification count
 */
router.get('/unread-count', protect, async (req, res, next) => {
  try {
    const result = await NotificationService.getUnreadCount(req.user._id)
    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    next(error)
  }
})

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
router.put('/:id/read', protect, validators.objectId, async (req, res, next) => {
  try {
    const notification = await NotificationService.markAsRead(req.params.id, req.user._id)
    res.json({
      success: true,
      data: notification
    })
  } catch (error) {
    error.statusCode = 404
    next(error)
  }
})

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all', protect, async (req, res, next) => {
  try {
    const result = await NotificationService.markAllAsRead(req.user._id)
    res.json({
      success: true,
      message: result.message
    })
  } catch (error) {
    next(error)
  }
})

/**
 * DELETE /api/notifications/:id
 * Delete notification
 */
router.delete('/:id', protect, validators.objectId, async (req, res, next) => {
  try {
    const result = await NotificationService.deleteNotification(req.params.id, req.user._id)
    res.json({
      success: true,
      message: result.message
    })
  } catch (error) {
    error.statusCode = 404
    next(error)
  }
})

/**
 * POST /api/notifications/subscribe
 * Subscribe to notifications (category/topic)
 */
router.post('/subscribe', protect, async (req, res, next) => {
  try {
    const { category } = req.body

    // Update user preferences
    const User = (await import('../models/User.js')).default
    await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { 'preferences.categories': category } }
    )

    res.json({
      success: true,
      message: `Subscribed to ${category} notifications`
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/notifications/unsubscribe
 * Unsubscribe from notifications
 */
router.post('/unsubscribe', protect, async (req, res, next) => {
  try {
    const { category } = req.body

    const User = (await import('../models/User.js')).default
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { 'preferences.categories': category } }
    )

    res.json({
      success: true,
      message: `Unsubscribed from ${category} notifications`
    })
  } catch (error) {
    next(error)
  }
})

export default router
