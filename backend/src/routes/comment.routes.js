/**
 * Comment Routes
 * /api/comments
 */
import { Router } from 'express'
import CommentService from '../services/CommentService.js'
import { protect, optionalAuth } from '../middleware/auth.js'
import { validators } from '../middleware/validate.js'

const router = Router()

/**
 * GET /api/comments/post/:postId
 * Get comments for a post
 */
router.get('/post/:postId', optionalAuth, validators.pagination, async (req, res, next) => {
  try {
    const { page, limit } = req.query
    const result = await CommentService.getCommentsByPost(req.params.postId, { page, limit })
    res.json({
      success: true,
      ...result
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/comments/user/:userId
 * Get comments by user
 */
router.get('/user/:userId', validators.pagination, async (req, res, next) => {
  try {
    const { page, limit } = req.query
    const result = await CommentService.getCommentsByUser(req.params.userId, { page, limit })
    res.json({
      success: true,
      ...result
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/comments/:postId
 * Create comment on post
 */
router.post('/:postId', protect, validators.createComment, async (req, res, next) => {
  try {
    const { content, parentCommentId } = req.body
    const comment = await CommentService.createComment(
      req.user._id,
      req.params.postId,
      content,
      parentCommentId
    )
    res.status(201).json({
      success: true,
      data: comment
    })
  } catch (error) {
    next(error)
  }
})

/**
 * PUT /api/comments/:id
 * Update comment
 */
router.put('/:id', protect, validators.objectId, async (req, res, next) => {
  try {
    const isAdmin = ['staff', 'admin'].includes(req.user.role)
    const comment = await CommentService.updateComment(
      req.params.id,
      req.user._id.toString(),
      req.body.content,
      isAdmin
    )
    res.json({
      success: true,
      data: comment
    })
  } catch (error) {
    error.statusCode = error.message.includes('Not authorized') ? 403 : 400
    next(error)
  }
})

/**
 * DELETE /api/comments/:id
 * Delete comment
 */
router.delete('/:id', protect, validators.objectId, async (req, res, next) => {
  try {
    const isAdmin = ['staff', 'admin'].includes(req.user.role)
    const result = await CommentService.deleteComment(req.params.id, req.user._id.toString(), isAdmin)
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
 * POST /api/comments/:id/vote
 * Vote on comment
 */
router.post('/:id/vote', protect, validators.objectId, async (req, res, next) => {
  try {
    const { type } = req.body // 'up', 'down', or 'none'
    const result = await CommentService.voteComment(req.params.id, req.user._id.toString(), type)
    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    next(error)
  }
})

export default router
