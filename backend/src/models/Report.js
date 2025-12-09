/**
 * Report Model
 * Handles content reporting and moderation requests
 */
import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contentType: {
    type: String,
    enum: ['post', 'comment', 'event', 'user'],
    required: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'contentType'
  },
  reason: {
    type: String,
    enum: [
      'spam',
      'harassment',
      'hate_speech',
      'misinformation',
      'inappropriate',
      'copyright',
      'privacy_violation',
      'other'
    ],
    required: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  resolution: {
    action: { type: String, enum: ['none', 'warning', 'content_removed', 'user_suspended', 'user_banned'] },
    notes: String,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date
  },
  screenshots: [{
    url: String,
    uploadedAt: Date
  }]
}, {
  timestamps: true
})

// Indexes
reportSchema.index({ status: 1, priority: -1, createdAt: 1 })
reportSchema.index({ contentType: 1, contentId: 1 })
reportSchema.index({ reporter: 1 })

// Prevent duplicate reports from same user for same content
reportSchema.index({ reporter: 1, contentType: 1, contentId: 1 }, { unique: true })

const Report = mongoose.model('Report', reportSchema)
export default Report
