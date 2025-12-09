/**
 * Analytics Routes
 * /api/analytics
 */
import { Router } from 'express'
import AnalyticsService from '../services/AnalyticsService.js'
import { protect, isStaffOrAdmin } from '../middleware/auth.js'

const router = Router()

// All analytics routes require staff/admin access
router.use(protect)
router.use(isStaffOrAdmin)

/**
 * GET /api/analytics/summary
 * Get dashboard summary
 */
router.get('/summary', async (req, res, next) => {
  try {
    const summary = await AnalyticsService.getDashboardSummary()
    res.json({
      success: true,
      data: summary
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/analytics/users/growth
 * Get user growth over time
 */
router.get('/users/growth', async (req, res, next) => {
  try {
    const { startDate, endDate, interval } = req.query

    // Default to last 30 days
    const end = endDate ? new Date(endDate) : new Date()
    const start = startDate ? new Date(startDate) : new Date(end - 30 * 24 * 60 * 60 * 1000)

    const growth = await AnalyticsService.getUserGrowth(start, end, interval)
    res.json({
      success: true,
      data: growth
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/analytics/users/activity
 * Get user activity by role
 */
router.get('/users/activity', async (req, res, next) => {
  try {
    const activity = await AnalyticsService.getUserActivityByRole()
    res.json({
      success: true,
      data: activity
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/analytics/users/geographic
 * Get geographic distribution
 */
router.get('/users/geographic', async (req, res, next) => {
  try {
    const distribution = await AnalyticsService.getGeographicDistribution()
    res.json({
      success: true,
      data: distribution
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/analytics/content/engagement
 * Get content engagement metrics
 */
router.get('/content/engagement', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query

    const end = endDate ? new Date(endDate) : new Date()
    const start = startDate ? new Date(startDate) : new Date(end - 30 * 24 * 60 * 60 * 1000)

    const engagement = await AnalyticsService.getContentEngagement(start, end)
    res.json({
      success: true,
      data: engagement
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/analytics/content/trending
 * Get trending topics
 */
router.get('/content/trending', async (req, res, next) => {
  try {
    const { days, limit } = req.query
    const trending = await AnalyticsService.getTrendingTopics(
      parseInt(days) || 7,
      parseInt(limit) || 10
    )
    res.json({
      success: true,
      data: trending
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/analytics/content/contributors
 * Get top contributors
 */
router.get('/content/contributors', async (req, res, next) => {
  try {
    const { limit } = req.query
    const contributors = await AnalyticsService.getTopContributors(parseInt(limit) || 10)
    res.json({
      success: true,
      data: contributors
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/analytics/events
 * Get event analytics
 */
router.get('/events', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query

    const end = endDate ? new Date(endDate) : new Date()
    const start = startDate ? new Date(startDate) : new Date(end - 30 * 24 * 60 * 60 * 1000)

    const analytics = await AnalyticsService.getEventAnalytics(start, end)
    res.json({
      success: true,
      data: analytics
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/analytics/report
 * Generate full analytics report
 */
router.get('/report', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query

    const end = endDate ? new Date(endDate) : new Date()
    const start = startDate ? new Date(startDate) : new Date(end - 30 * 24 * 60 * 60 * 1000)

    const report = await AnalyticsService.generateReport(start, end)
    res.json({
      success: true,
      data: report
    })
  } catch (error) {
    next(error)
  }
})

export default router
