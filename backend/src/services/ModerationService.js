/**
 * Moderation Service
 * Handles content moderation and user reports
 */
import Report from '../models/Report.js'
import Post from '../models/Post.js'
import Comment from '../models/Comment.js'
import User from '../models/User.js'
import NotificationService from './NotificationService.js'

class ModerationService {
  /**
   * Create a report
   */
  async createReport (reporterId, data) {
    const { contentType, contentId, reason, description, screenshots } = data

    // Verify content exists
    let content
    switch (contentType) {
      case 'post':
        content = await Post.findById(contentId)
        break
      case 'comment':
        content = await Comment.findById(contentId)
        break
      case 'user':
        content = await User.findById(contentId)
        break
      default:
        throw new Error('Invalid content type')
    }

    if (!content) {
      throw new Error(`${contentType} not found`)
    }

    const report = await Report.create({
      reporter: reporterId,
      contentType,
      contentId,
      reason,
      description,
      screenshots
    })

    return report
  }

  /**
   * Get reports (admin)
   */
  async getReports (filters = {}, options = {}) {
    const { status, contentType, priority, reason } = filters
    const { page = 1, limit = 20, sort = '-createdAt' } = options

    const query = {}

    if (status) query.status = status
    if (contentType) query.contentType = contentType
    if (priority) query.priority = priority
    if (reason) query.reason = reason

    const reports = await Report.find(query)
      .populate('reporter', 'firstName lastName email')
      .populate('resolution.resolvedBy', 'firstName lastName')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sort)

    const total = await Report.countDocuments(query)

    return {
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * Get single report
   */
  async getReportById (reportId) {
    const report = await Report.findById(reportId)
      .populate('reporter', 'firstName lastName email')
      .populate('resolution.resolvedBy', 'firstName lastName')

    if (!report) {
      throw new Error('Report not found')
    }

    // Get the reported content
    let content
    switch (report.contentType) {
      case 'post':
        content = await Post.findById(report.contentId).populate('author', 'firstName lastName email')
        break
      case 'comment':
        content = await Comment.findById(report.contentId).populate('author', 'firstName lastName email')
        break
      case 'user':
        content = await User.findById(report.contentId)
        break
    }

    return {
      report,
      content
    }
  }

  /**
   * Resolve report
   */
  async resolveReport (reportId, adminId, resolution) {
    const { action, notes } = resolution

    const report = await Report.findById(reportId)

    if (!report) {
      throw new Error('Report not found')
    }

    report.status = 'resolved'
    report.resolution = {
      action,
      notes,
      resolvedBy: adminId,
      resolvedAt: new Date()
    }

    // Apply action
    await this.applyModerationAction(report.contentType, report.contentId, action, adminId)

    await report.save()

    return report
  }

  /**
   * Apply moderation action
   */
  async applyModerationAction (contentType, contentId, action, adminId) {
    switch (action) {
      case 'content_removed':
        if (contentType === 'post') {
          await Post.findByIdAndUpdate(contentId, {
            status: 'rejected',
            moderatedBy: adminId,
            moderatedAt: new Date()
          })
        } else if (contentType === 'comment') {
          await Comment.findByIdAndUpdate(contentId, {
            status: 'hidden',
            moderatedBy: adminId,
            moderatedAt: new Date()
          })
        }
        break

      case 'user_suspended':
        await User.findByIdAndUpdate(contentId, { isActive: false })
        break

      case 'user_banned':
        await User.findByIdAndUpdate(contentId, { isActive: false })
        // In production, add to ban list
        break

      case 'warning': {
        // Send warning notification to content author
        let authorId
        if (contentType === 'post') {
          const post = await Post.findById(contentId)
          authorId = post?.author
        } else if (contentType === 'comment') {
          const comment = await Comment.findById(contentId)
          authorId = comment?.author
        } else {
          authorId = contentId
        }

        if (authorId) {
          await NotificationService.createNotification(authorId, {
            type: 'moderation_action',
            title: 'Content Warning',
            message: 'Your content has been flagged for review. Please review our community guidelines.',
            priority: 'high'
          })
        }
        break
      }
    }
  }

  /**
   * Dismiss report
   */
  async dismissReport (reportId, adminId, notes = '') {
    const report = await Report.findById(reportId)

    if (!report) {
      throw new Error('Report not found')
    }

    report.status = 'dismissed'
    report.resolution = {
      action: 'none',
      notes,
      resolvedBy: adminId,
      resolvedAt: new Date()
    }

    await report.save()

    return report
  }

  /**
   * Get moderation stats
   */
  async getModerationStats () {
    const [pending, resolved, dismissed] = await Promise.all([
      Report.countDocuments({ status: 'pending' }),
      Report.countDocuments({ status: 'resolved' }),
      Report.countDocuments({ status: 'dismissed' })
    ])

    const byReason = await Report.aggregate([
      { $group: { _id: '$reason', count: { $sum: 1 } } }
    ])

    const byContentType = await Report.aggregate([
      { $group: { _id: '$contentType', count: { $sum: 1 } } }
    ])

    return {
      totals: { pending, resolved, dismissed },
      byReason: Object.fromEntries(byReason.map(r => [r._id, r.count])),
      byContentType: Object.fromEntries(byContentType.map(r => [r._id, r.count]))
    }
  }
}

export default new ModerationService()
