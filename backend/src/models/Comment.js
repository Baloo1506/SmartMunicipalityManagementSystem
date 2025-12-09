/**
 * Comment Model
 * Handles comments on posts and discussions
 */
import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    maxlength: [2000, 'Comment cannot exceed 2000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'hidden', 'deleted', 'flagged'],
    default: 'active'
  },
  votes: {
    up: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    down: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  moderationNotes: String,
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Index for efficient queries
commentSchema.index({ post: 1, createdAt: -1 })
commentSchema.index({ author: 1 })
commentSchema.index({ parentComment: 1 })

// Virtual for vote score
commentSchema.virtual('voteScore').get(function () {
  return (this.votes?.up?.length || 0) - (this.votes?.down?.length || 0)
})

// Update comment count on post when comment is saved
commentSchema.post('save', async function () {
  const Comment = this.constructor
  const count = await Comment.countDocuments({ post: this.post, status: 'active' })
  await mongoose.model('Post').findByIdAndUpdate(this.post, { commentCount: count })
})

const Comment = mongoose.model('Comment', commentSchema)
export default Comment
