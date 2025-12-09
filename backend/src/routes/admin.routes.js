/**
 * Admin Routes
 * /api/admin
 */
import { Router } from 'express'
import ModerationService from '../services/ModerationService.js'
import UserService from '../services/UserService.js'
import { protect, isAdmin, isStaffOrAdmin } from '../middleware/auth.js'
import { validators } from '../middleware/validate.js'

const router = Router()

// All admin routes require authentication and admin/staff role
router.use(protect)
router.use(isStaffOrAdmin)

/**
 * GET /api/admin/reports
 * Get all reports
 */
router.get('/reports', validators.pagination, async (req, res, next) => {
  try {
    const { page, limit, status, contentType, priority, reason } = req.query
    const result = await ModerationService.getReports(
      { status, contentType, priority, reason },
      { page, limit }
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
 * GET /api/admin/reports/stats
 * Get moderation statistics
 */
router.get('/reports/stats', async (req, res, next) => {
  try {
    const stats = await ModerationService.getModerationStats()
    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/admin/reports/:id
 * Get single report with content
 */
router.get('/reports/:id', validators.objectId, async (req, res, next) => {
  try {
    const result = await ModerationService.getReportById(req.params.id)
    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    error.statusCode = 404
    next(error)
  }
})

/**
 * POST /api/admin/reports/:id/resolve
 * Resolve a report
 */
router.post('/reports/:id/resolve', validators.objectId, async (req, res, next) => {
  try {
    const { action, notes } = req.body
    const report = await ModerationService.resolveReport(
      req.params.id,
      req.user._id,
      { action, notes }
    )
    res.json({
      success: true,
      data: report
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/admin/reports/:id/dismiss
 * Dismiss a report
 */
router.post('/reports/:id/dismiss', validators.objectId, async (req, res, next) => {
  try {
    const { notes } = req.body
    const report = await ModerationService.dismissReport(req.params.id, req.user._id, notes)
    res.json({
      success: true,
      data: report
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/admin/users
 * Get all users (with search)
 */
router.get('/users', validators.pagination, async (req, res, next) => {
  try {
    const { query, page, limit, role, isActive } = req.query
    const result = await UserService.searchUsers(query, {
      page,
      limit,
      role,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
    })
    res.json({
      success: true,
      ...result
    })
  } catch (error) {
    next(error)
  }
})

/**
 * PUT /api/admin/users/:id/role
 * Update user role (admin only)
 */
router.put('/users/:id/role', isAdmin, validators.objectId, async (req, res, next) => {
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

/**
 * PUT /api/admin/users/:id/status
 * Activate/deactivate user
 */
router.put('/users/:id/status', validators.objectId, async (req, res, next) => {
  try {
    const User = (await import('../models/User.js')).default
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive },
      { new: true }
    )
    
    if (!user) {
      const error = new Error('User not found')
      error.statusCode = 404
      throw error
    }
    
    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
})

export default router
