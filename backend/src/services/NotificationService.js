/**
 * Notification Service
 * Handles in-app, email, and SMS notifications
 */
import Notification from '../models/Notification.js'
import User from '../models/User.js'
import { emitToUser } from '../config/socket.js'
// import nodemailer from 'nodemailer'

class NotificationService {
  /**
   * Create and send notification
   */
  async createNotification(recipientId, data) {
    const { type, title, message, entityType, entityId, url, priority = 'normal' } = data

    // Get user preferences
    const user = await User.findById(recipientId)
    if (!user) {
      throw new Error('Recipient not found')
    }

    // Determine delivery methods based on user preferences
    const deliveryMethods = []
    const prefs = user.preferences?.notifications || {}

    if (prefs.inApp !== false) {
      deliveryMethods.push({ method: 'inApp', status: 'pending' })
    }
    if (prefs.email) {
      deliveryMethods.push({ method: 'email', status: 'pending' })
    }
    if (prefs.sms) {
      deliveryMethods.push({ method: 'sms', status: 'pending' })
    }

    const notification = await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      data: { entityType, entityId, url },
      deliveryMethods,
      priority
    })

    // Send in-app notification via socket
    try {
      emitToUser(recipientId, 'notification', {
        id: notification._id,
        type,
        title,
        message,
        createdAt: notification.createdAt
      })

      // Mark in-app as sent
      const inAppDelivery = notification.deliveryMethods.find(d => d.method === 'inApp')
      if (inAppDelivery) {
        inAppDelivery.status = 'sent'
        inAppDelivery.sentAt = new Date()
      }
    } catch (e) {
      console.log('Socket not available')
    }

    // Queue email notification (in production, use job queue like Bull)
    // await this.sendEmailNotification(user.email, title, message)

    await notification.save()

    return notification
  }

  /**
   * Send notification to multiple users
   */
  async sendBulkNotification(recipientIds, data) {
    const notifications = await Promise.all(
      recipientIds.map(id => this.createNotification(id, data).catch(e => null))
    )

    return notifications.filter(n => n !== null)
  }

  /**
   * Send notification to all subscribers of a category
   */
  async notifySubscribers(category, data) {
    const subscribers = await User.find({
      'preferences.categories': category,
      isActive: true
    }).select('_id')

    return this.sendBulkNotification(
      subscribers.map(s => s._id.toString()),
      data
    )
  }

  /**
   * Get notifications for user
   */
  async getUserNotifications(userId, options = {}) {
    const { page = 1, limit = 20, unreadOnly = false } = options

    const query = { recipient: userId }
    if (unreadOnly) {
      query.isRead = false
    }

    const notifications = await Notification.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort('-createdAt')

    const total = await Notification.countDocuments(query)
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    })

    return {
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    })

    if (!notification) {
      throw new Error('Notification not found')
    }

    await notification.markAsRead()

    return notification
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    )

    return { message: 'All notifications marked as read' }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId, userId) {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    })

    if (!notification) {
      throw new Error('Notification not found')
    }

    return { message: 'Notification deleted' }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    const count = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    })

    return { count }
  }

  /**
   * Send email notification (placeholder - implement with nodemailer)
   */
  async sendEmailNotification(email, subject, message) {
    // In production, configure nodemailer with SendGrid or SMTP
    console.log(`[Email] To: ${email}, Subject: ${subject}`)
    return true
  }
}

export default new NotificationService()
