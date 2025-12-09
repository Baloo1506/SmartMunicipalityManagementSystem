/**
 * Post Model
 * Handles announcements, news, and discussions
 */
import mongoose from 'mongoose'

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: [10000, 'Content cannot exceed 10000 characters']
  },
  excerpt: {
    type: String,
    maxlength: 500
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['news', 'announcement', 'discussion', 'alert', 'event'],
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
    address: String,
    city: String,
    region: String
  },
  images: [{
    url: String,
    caption: String,
    altText: String
  }],
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number
  }],
  isOfficial: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'archived', 'rejected'],
    default: 'published'
  },
  visibility: {
    type: String,
    enum: ['public', 'registered', 'staff'],
    default: 'public'
  },
  votes: {
    up: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    down: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  viewCount: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  },
  publishedAt: Date,
  expiresAt: Date,
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

// Index for location-based queries
postSchema.index({ 'location.coordinates': '2dsphere' })
postSchema.index({ title: 'text', content: 'text', tags: 'text' })
postSchema.index({ category: 1, status: 1, publishedAt: -1 })

// Virtual for vote score
postSchema.virtual('voteScore').get(function() {
  return (this.votes?.up?.length || 0) - (this.votes?.down?.length || 0)
})

// Generate excerpt if not provided
postSchema.pre('save', function(next) {
  if (!this.excerpt && this.content) {
    this.excerpt = this.content.substring(0, 200) + (this.content.length > 200 ? '...' : '')
  }
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date()
  }
  next()
})

const Post = mongoose.model('Post', postSchema)
export default Post
