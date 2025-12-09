/**
 * Notification Model
 * Handles user notifications (email, SMS, in-app)
 */
import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'new_post',
      'new_comment',
      'comment_reply',
      'post_vote',
      'event_reminder',
      'event_update',
      'system_alert',
      'moderation_action',
      'welcome',
      'announcement'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  data: {
    // Reference to related entity
    entityType: { type: String, enum: ['post', 'comment', 'event', 'user'] },
    entityId: mongoose.Schema.Types.ObjectId,
    url: String,
    metadata: mongoose.Schema.Types.Mixed
  },
  deliveryMethods: [{
    method: { type: String, enum: ['email', 'sms', 'inApp'], required: true },
    status: { type: String, enum: ['pending', 'sent', 'delivered', 'failed'], default: 'pending' },
    sentAt: Date,
    error: String
  }],
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  expiresAt: Date
}, {
  timestamps: true
})

// Indexes
notificationSchema.index({ recipient: 1, createdAt: -1 })
notificationSchema.index({ recipient: 1, isRead: 1 })
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Mark as read method
notificationSchema.methods.markAsRead = async function () {
  this.isRead = true
  this.readAt = new Date()
  return this.save()
}

const Notification = mongoose.model('Notification', notificationSchema)
export default Notification
