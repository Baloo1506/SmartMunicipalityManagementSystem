/**
 * Comment Service
 * Handles comments on posts
 */
import Comment from '../models/Comment.js'
import Post from '../models/Post.js'
import { emitToUser } from '../config/socket.js'

class CommentService {
  /**
   * Create a comment
   */
  async createComment(authorId, postId, content, parentCommentId = null) {
    // Verify post exists
    const post = await Post.findById(postId)
    if (!post) {
      throw new Error('Post not found')
    }

    // Verify parent comment exists if provided
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId)
      if (!parentComment) {
        throw new Error('Parent comment not found')
      }
    }

    const comment = await Comment.create({
      content,
      author: authorId,
      post: postId,
      parentComment: parentCommentId
    })

    await comment.populate('author', 'firstName lastName avatar')

    // Notify post author
    if (post.author.toString() !== authorId) {
      try {
        emitToUser(post.author.toString(), 'new_comment', {
          postId,
          postTitle: post.title,
          commentId: comment._id,
          commenter: comment.author.fullName
        })
      } catch (e) {
        console.log('Socket notification failed')
      }
    }

    // Notify parent comment author if this is a reply
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId)
      if (parentComment && parentComment.author.toString() !== authorId) {
        try {
          emitToUser(parentComment.author.toString(), 'comment_reply', {
            postId,
            commentId: comment._id,
            replier: comment.author.fullName
          })
        } catch (e) {
          console.log('Socket notification failed')
        }
      }
    }

    return comment
  }

  /**
   * Get comments for a post
   */
  async getCommentsByPost(postId, options = {}) {
    const { page = 1, limit = 50, sort = '-createdAt' } = options

    const comments = await Comment.find({
      post: postId,
      status: 'active',
      parentComment: null // Top-level comments only
    })
      .populate('author', 'firstName lastName avatar role')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sort)

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({
          parentComment: comment._id,
          status: 'active'
        })
          .populate('author', 'firstName lastName avatar role')
          .sort('createdAt')

        return {
          ...comment.toJSON(),
          replies
        }
      })
    )

    const total = await Comment.countDocuments({
      post: postId,
      status: 'active',
      parentComment: null
    })

    return {
      comments: commentsWithReplies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * Update comment
   */
  async updateComment(commentId, authorId, content, isAdmin = false) {
    const comment = await Comment.findById(commentId)

    if (!comment) {
      throw new Error('Comment not found')
    }

    if (comment.author.toString() !== authorId && !isAdmin) {
      throw new Error('Not authorized to update this comment')
    }

    comment.content = content
    comment.isEdited = true
    comment.editedAt = new Date()

    await comment.save()
    await comment.populate('author', 'firstName lastName avatar')

    return comment
  }

  /**
   * Delete comment (soft delete)
   */
  async deleteComment(commentId, userId, isAdmin = false) {
    const comment = await Comment.findById(commentId)

    if (!comment) {
      throw new Error('Comment not found')
    }

    if (comment.author.toString() !== userId && !isAdmin) {
      throw new Error('Not authorized to delete this comment')
    }

    comment.status = 'deleted'
    comment.content = '[Comment deleted]'
    await comment.save()

    return { message: 'Comment deleted' }
  }

  /**
   * Vote on comment
   */
  async voteComment(commentId, userId, voteType) {
    const comment = await Comment.findById(commentId)

    if (!comment) {
      throw new Error('Comment not found')
    }

    // Remove existing vote
    comment.votes.up = comment.votes.up.filter(id => id.toString() !== userId)
    comment.votes.down = comment.votes.down.filter(id => id.toString() !== userId)

    // Add new vote
    if (voteType === 'up') {
      comment.votes.up.push(userId)
    } else if (voteType === 'down') {
      comment.votes.down.push(userId)
    }

    await comment.save()

    return {
      voteScore: comment.voteScore,
      upvotes: comment.votes.up.length,
      downvotes: comment.votes.down.length
    }
  }

  /**
   * Get comments by user
   */
  async getCommentsByUser(userId, options = {}) {
    const { page = 1, limit = 20 } = options

    const comments = await Comment.find({
      author: userId,
      status: { $ne: 'deleted' }
    })
      .populate('post', 'title')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort('-createdAt')

    const total = await Comment.countDocuments({
      author: userId,
      status: { $ne: 'deleted' }
    })

    return {
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }
}

export default new CommentService()
