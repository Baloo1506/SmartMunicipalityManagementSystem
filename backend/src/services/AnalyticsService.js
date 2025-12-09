/**
 * Analytics Service
 * Provides engagement metrics and statistics
 */
import Post from '../models/Post.js'
import Comment from '../models/Comment.js'
import Event from '../models/Event.js'
import User from '../models/User.js'
import Report from '../models/Report.js'

class AnalyticsService {
  /**
   * Get dashboard summary
   */
  async getDashboardSummary() {
    const [
      totalUsers,
      activeUsers,
      totalPosts,
      totalComments,
      totalEvents,
      pendingReports
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Post.countDocuments({ status: 'published' }),
      Comment.countDocuments({ status: 'active' }),
      Event.countDocuments({ status: 'published' }),
      Report.countDocuments({ status: 'pending' })
    ])

    return {
      users: {
        total: totalUsers,
        active: activeUsers
      },
      content: {
        posts: totalPosts,
        comments: totalComments,
        events: totalEvents
      },
      moderation: {
        pendingReports
      }
    }
  }

  /**
   * Get user growth over time
   */
  async getUserGrowth(startDate, endDate, interval = 'day') {
    const matchStage = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }

    const groupFormat = interval === 'month' 
      ? { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }
      : { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } }

    const growth = await User.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupFormat,
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ])

    return growth
  }

  /**
   * Get content engagement metrics
   */
  async getContentEngagement(startDate, endDate) {
    const matchStage = {
      publishedAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      status: 'published'
    }

    const [postStats, categoryStats] = await Promise.all([
      Post.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalPosts: { $sum: 1 },
            totalViews: { $sum: '$viewCount' },
            totalComments: { $sum: '$commentCount' },
            avgViews: { $avg: '$viewCount' },
            avgComments: { $avg: '$commentCount' }
          }
        }
      ]),
      Post.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalViews: { $sum: '$viewCount' },
            totalComments: { $sum: '$commentCount' }
          }
        },
        { $sort: { count: -1 } }
      ])
    ])

    return {
      overall: postStats[0] || {},
      byCategory: categoryStats
    }
  }

  /**
   * Get event analytics
   */
  async getEventAnalytics(startDate, endDate) {
    const matchStage = {
      startDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }

    const [eventStats, categoryStats] = await Promise.all([
      Event.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalEvents: { $sum: 1 },
            totalRegistrations: { $sum: { $size: '$attendees' } },
            avgRegistrations: { $avg: { $size: '$attendees' } }
          }
        }
      ]),
      Event.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalRegistrations: { $sum: { $size: '$attendees' } }
          }
        },
        { $sort: { count: -1 } }
      ])
    ])

    return {
      overall: eventStats[0] || {},
      byCategory: categoryStats
    }
  }

  /**
   * Get top contributors
   */
  async getTopContributors(limit = 10) {
    const topPosters = await Post.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$author', postCount: { $sum: 1 } } },
      { $sort: { postCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          firstName: '$user.firstName',
          lastName: '$user.lastName',
          avatar: '$user.avatar',
          postCount: 1
        }
      }
    ])

    const topCommenters = await Comment.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$author', commentCount: { $sum: 1 } } },
      { $sort: { commentCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          firstName: '$user.firstName',
          lastName: '$user.lastName',
          avatar: '$user.avatar',
          commentCount: 1
        }
      }
    ])

    return { topPosters, topCommenters }
  }

  /**
   * Get trending topics/tags
   */
  async getTrendingTopics(days = 7, limit = 10) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const trending = await Post.aggregate([
      {
        $match: {
          publishedAt: { $gte: startDate },
          status: 'published'
        }
      },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 },
          totalViews: { $sum: '$viewCount' }
        }
      },
      {
        $addFields: {
          score: { $add: ['$count', { $divide: ['$totalViews', 100] }] }
        }
      },
      { $sort: { score: -1 } },
      { $limit: limit }
    ])

    return trending
  }

  /**
   * Get user activity by role
   */
  async getUserActivityByRole() {
    const activity = await User.aggregate([
      {
        $group: {
          _id: '$role',
          total: { $sum: 1 },
          active: {
            $sum: { $cond: ['$isActive', 1, 0] }
          },
          verified: {
            $sum: { $cond: ['$isVerified', 1, 0] }
          }
        }
      }
    ])

    return activity
  }

  /**
   * Get geographic distribution
   */
  async getGeographicDistribution() {
    const distribution = await User.aggregate([
      { $match: { 'address.city': { $exists: true, $ne: '' } } },
      {
        $group: {
          _id: '$address.city',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ])

    return distribution
  }

  /**
   * Export analytics report
   */
  async generateReport(startDate, endDate) {
    const [
      summary,
      userGrowth,
      contentEngagement,
      eventAnalytics,
      topContributors,
      trendingTopics
    ] = await Promise.all([
      this.getDashboardSummary(),
      this.getUserGrowth(startDate, endDate),
      this.getContentEngagement(startDate, endDate),
      this.getEventAnalytics(startDate, endDate),
      this.getTopContributors(5),
      this.getTrendingTopics(30, 10)
    ])

    return {
      generatedAt: new Date(),
      period: { startDate, endDate },
      summary,
      userGrowth,
      contentEngagement,
      eventAnalytics,
      topContributors,
      trendingTopics
    }
  }
}

export default new AnalyticsService()
