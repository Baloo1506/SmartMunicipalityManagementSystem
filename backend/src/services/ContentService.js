/**
 * Content Service
 * Handles posts, announcements, and discussions
 */
import Post from '../models/Post.js'
import { emitToTopic, broadcast } from '../config/socket.js'

class ContentService {
  /**
   * Create a new post
   */
  async createPost(authorId, postData) {
    const post = await Post.create({
      ...postData,
      author: authorId
    })

    // Populate author for response
    await post.populate('author', 'firstName lastName avatar role')

    // Emit real-time notification for subscribers
    try {
      if (post.status === 'published') {
        emitToTopic(post.category, 'new_post', {
          id: post._id,
          title: post.title,
          category: post.category,
          author: post.author.fullName
        })
      }
    } catch (e) {
      console.log('Socket not initialized yet')
    }

    return post
  }

  /**
   * Get all posts with filters
   */
  async getPosts(filters = {}, options = {}) {
    const {
      category,
      status = 'published',
      isOfficial,
      author,
      search,
      tags,
      startDate,
      endDate
    } = filters

    const { page = 1, limit = 20, sort = '-publishedAt' } = options

    const query = {}

    if (category) query.category = category
    if (status) query.status = status
    if (isOfficial !== undefined) query.isOfficial = isOfficial
    if (author) query.author = author
    if (tags && tags.length) query.tags = { $in: tags }
    
    if (search) {
      query.$text = { $search: search }
    }

    if (startDate || endDate) {
      query.publishedAt = {}
      if (startDate) query.publishedAt.$gte = new Date(startDate)
      if (endDate) query.publishedAt.$lte = new Date(endDate)
    }

    const posts = await Post.find(query)
      .populate('author', 'firstName lastName avatar role')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sort)

    const total = await Post.countDocuments(query)

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * Get single post by ID
   */
  async getPostById(postId, incrementView = true) {
    const post = await Post.findById(postId)
      .populate('author', 'firstName lastName avatar role')

    if (!post) {
      throw new Error('Post not found')
    }

    if (incrementView) {
      post.viewCount += 1
      await post.save()
    }

    return post
  }

  /**
   * Update post
   */
  async updatePost(postId, authorId, updates, isAdmin = false) {
    const post = await Post.findById(postId)

    if (!post) {
      throw new Error('Post not found')
    }

    // Only author or admin can update
    if (post.author.toString() !== authorId && !isAdmin) {
      throw new Error('Not authorized to update this post')
    }

    const allowedUpdates = ['title', 'content', 'category', 'tags', 'images', 'attachments', 'status', 'visibility']
    if (isAdmin) {
      allowedUpdates.push('isOfficial', 'isPinned', 'moderationNotes')
    }

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        post[key] = updates[key]
      }
    }

    await post.save()
    await post.populate('author', 'firstName lastName avatar role')

    return post
  }

  /**
   * Delete post
   */
  async deletePost(postId, userId, isAdmin = false) {
    const post = await Post.findById(postId)

    if (!post) {
      throw new Error('Post not found')
    }

    if (post.author.toString() !== userId && !isAdmin) {
      throw new Error('Not authorized to delete this post')
    }

    await Post.findByIdAndDelete(postId)

    return { message: 'Post deleted successfully' }
  }

  /**
   * Vote on post
   */
  async votePost(postId, userId, voteType) {
    const post = await Post.findById(postId)

    if (!post) {
      throw new Error('Post not found')
    }

    // Remove existing vote if any
    post.votes.up = post.votes.up.filter(id => id.toString() !== userId)
    post.votes.down = post.votes.down.filter(id => id.toString() !== userId)

    // Add new vote
    if (voteType === 'up') {
      post.votes.up.push(userId)
    } else if (voteType === 'down') {
      post.votes.down.push(userId)
    }
    // If voteType is 'none', just remove the vote (already done above)

    await post.save()

    return {
      voteScore: post.voteScore,
      upvotes: post.votes.up.length,
      downvotes: post.votes.down.length
    }
  }

  /**
   * Get trending posts
   */
  async getTrendingPosts(limit = 10) {
    const posts = await Post.aggregate([
      { $match: { status: 'published' } },
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: [{ $subtract: [{ $size: '$votes.up' }, { $size: '$votes.down' }] }, 2] },
              '$commentCount',
              { $divide: ['$viewCount', 100] }
            ]
          }
        }
      },
      { $sort: { score: -1 } },
      { $limit: limit }
    ])

    return Post.populate(posts, { path: 'author', select: 'firstName lastName avatar' })
  }

  /**
   * Get posts near location
   */
  async getPostsNearLocation(coordinates, maxDistance = 10000, limit = 20) {
    const posts = await Post.find({
      status: 'published',
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates
          },
          $maxDistance: maxDistance
        }
      }
    })
      .populate('author', 'firstName lastName avatar')
      .limit(limit)

    return posts
  }
}

export default new ContentService()
