/**
 * Event Routes
 * /api/events
 */
import { Router } from 'express'
import EventService from '../services/EventService.js'
import { protect, optionalAuth } from '../middleware/auth.js'
import { validators } from '../middleware/validate.js'

const router = Router()

/**
 * GET /api/events
 * Get all events
 */
router.get('/', optionalAuth, validators.pagination, async (req, res, next) => {
  try {
    const { page, limit, category, search, upcoming, startDate, endDate, isOfficial } = req.query

    const result = await EventService.getEvents(
      {
        category,
        search,
        upcoming: upcoming !== 'false',
        startDate,
        endDate,
        isOfficial
      },
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
 * GET /api/events/near
 * Get events near location
 */
router.get('/near', async (req, res, next) => {
  try {
    const { lng, lat, distance, limit } = req.query
    const events = await EventService.getEventsNearLocation(
      [parseFloat(lng), parseFloat(lat)],
      parseInt(distance) || 10000,
      parseInt(limit) || 20
    )
    res.json({
      success: true,
      data: events
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/events/my
 * Get user's registered events
 */
router.get('/my', protect, validators.pagination, async (req, res, next) => {
  try {
    const { page, limit, status } = req.query
    const result = await EventService.getUserEvents(req.user._id, { page, limit, status })
    res.json({
      success: true,
      ...result
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/events/:id
 * Get single event
 */
router.get('/:id', optionalAuth, validators.objectId, async (req, res, next) => {
  try {
    const event = await EventService.getEventById(req.params.id)
    res.json({
      success: true,
      data: event
    })
  } catch (error) {
    error.statusCode = 404
    next(error)
  }
})

/**
 * POST /api/events
 * Create new event
 */
router.post('/', protect, validators.createEvent, async (req, res, next) => {
  try {
    // Only staff/admin can create official events
    if (req.body.isOfficial && !['staff', 'admin'].includes(req.user.role)) {
      req.body.isOfficial = false
    }

    const event = await EventService.createEvent(req.user._id, req.body)
    res.status(201).json({
      success: true,
      data: event
    })
  } catch (error) {
    next(error)
  }
})

/**
 * PUT /api/events/:id
 * Update event
 */
router.put('/:id', protect, validators.objectId, async (req, res, next) => {
  try {
    const isAdmin = ['staff', 'admin'].includes(req.user.role)
    const event = await EventService.updateEvent(req.params.id, req.user._id.toString(), req.body, isAdmin)
    res.json({
      success: true,
      data: event
    })
  } catch (error) {
    error.statusCode = error.message.includes('Not authorized') ? 403 : 400
    next(error)
  }
})

/**
 * DELETE /api/events/:id
 * Delete event
 */
router.delete('/:id', protect, validators.objectId, async (req, res, next) => {
  try {
    const isAdmin = ['staff', 'admin'].includes(req.user.role)
    const result = await EventService.deleteEvent(req.params.id, req.user._id.toString(), isAdmin)
    res.json({
      success: true,
      message: result.message
    })
  } catch (error) {
    error.statusCode = error.message.includes('Not authorized') ? 403 : 404
    next(error)
  }
})

/**
 * POST /api/events/:id/register
 * Register for event
 */
router.post('/:id/register', protect, validators.objectId, async (req, res, next) => {
  try {
    const result = await EventService.registerForEvent(req.params.id, req.user._id)
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
 * DELETE /api/events/:id/register
 * Cancel registration
 */
router.delete('/:id/register', protect, validators.objectId, async (req, res, next) => {
  try {
    const result = await EventService.cancelRegistration(req.params.id, req.user._id)
    res.json({
      success: true,
      message: result.message
    })
  } catch (error) {
    error.statusCode = 400
    next(error)
  }
})

export default router
