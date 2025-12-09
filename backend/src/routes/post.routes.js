/**
 * Post Routes
 * /api/posts
 */
import { Router } from 'express'
import ContentService from '../services/ContentService.js'
import { protect, optionalAuth, isStaffOrAdmin } from '../middleware/auth.js'
import { validators } from '../middleware/validate.js'

const router = Router()

/**
 * GET /api/posts
 * Get all posts
 */
router.get('/', optionalAuth, validators.pagination, async (req, res, next) => {
  try {
    const { page, limit, category, search, tags, isOfficial, startDate, endDate } = req.query
    
    const result = await ContentService.getPosts(
      { category, search, tags: tags?.split(','), isOfficial, startDate, endDate },
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
 * GET /api/posts/trending
 * Get trending posts
 */
router.get('/trending', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const posts = await ContentService.getTrendingPosts(limit)
    res.json({
      success: true,
      data: posts
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/posts/near
 * Get posts near location
 */
router.get('/near', async (req, res, next) => {
  try {
    const { lng, lat, distance, limit } = req.query
    const posts = await ContentService.getPostsNearLocation(
      [parseFloat(lng), parseFloat(lat)],
      parseInt(distance) || 10000,
      parseInt(limit) || 20
    )
    res.json({
      success: true,
      data: posts
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/posts/:id
 * Get single post
 */
router.get('/:id', optionalAuth, validators.objectId, async (req, res, next) => {
  try {
    const post = await ContentService.getPostById(req.params.id)
    res.json({
      success: true,
      data: post
    })
  } catch (error) {
    error.statusCode = 404
    next(error)
  }
})

/**
 * POST /api/posts
 * Create new post
 */
router.post('/', protect, validators.createPost, async (req, res, next) => {
  try {
    // Only staff/admin can create official posts
    if (req.body.isOfficial && !['staff', 'admin'].includes(req.user.role)) {
      req.body.isOfficial = false
    }
    
    const post = await ContentService.createPost(req.user._id, req.body)
    res.status(201).json({
      success: true,
      data: post
    })
  } catch (error) {
    next(error)
  }
})

/**
 * PUT /api/posts/:id
 * Update post
 */
router.put('/:id', protect, validators.objectId, validators.updatePost, async (req, res, next) => {
  try {
    const isAdmin = ['staff', 'admin'].includes(req.user.role)
    const post = await ContentService.updatePost(req.params.id, req.user._id.toString(), req.body, isAdmin)
    res.json({
      success: true,
      data: post
    })
  } catch (error) {
    error.statusCode = error.message.includes('Not authorized') ? 403 : 400
    next(error)
  }
})

/**
 * DELETE /api/posts/:id
 * Delete post
 */
router.delete('/:id', protect, validators.objectId, async (req, res, next) => {
  try {
    const isAdmin = ['staff', 'admin'].includes(req.user.role)
    const result = await ContentService.deletePost(req.params.id, req.user._id.toString(), isAdmin)
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
 * POST /api/posts/:id/vote
 * Vote on post
 */
router.post('/:id/vote', protect, validators.objectId, async (req, res, next) => {
  try {
    const { type } = req.body // 'up', 'down', or 'none'
    const result = await ContentService.votePost(req.params.id, req.user._id.toString(), type)
    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    next(error)
  }
})

export default router
