/**
 * User Service
 * Handles user profile management and subscriptions
 */
import User from '../models/User.js'

class UserService {
  /**
   * Get user by ID
   */
  async getUserById (userId) {
    const user = await User.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }
    return user
  }

  /**
   * Get user profile
   */
  async getProfile (userId) {
    return this.getUserById(userId)
  }

  /**
   * Update user profile
   */
  async updateProfile (userId, updates) {
    const allowedUpdates = ['firstName', 'lastName', 'phone', 'address', 'avatar', 'preferences']
    const filteredUpdates = {}

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key]
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    )

    if (!user) {
      throw new Error('User not found')
    }

    return user
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences (userId, preferences) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { 'preferences.notifications': preferences } },
      { new: true }
    )

    if (!user) {
      throw new Error('User not found')
    }

    return user.preferences.notifications
  }

  /**
   * Add subscription
   */
  async addSubscription (userId, subscription) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { subscriptions: subscription } },
      { new: true }
    )

    if (!user) {
      throw new Error('User not found')
    }

    return user.subscriptions
  }

  /**
   * Remove subscription
   */
  async removeSubscription (userId, subscriptionId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { subscriptions: { _id: subscriptionId } } },
      { new: true }
    )

    if (!user) {
      throw new Error('User not found')
    }

    return user.subscriptions
  }

  /**
   * Get user subscriptions
   */
  async getSubscriptions (userId) {
    const user = await User.findById(userId).select('subscriptions')
    if (!user) {
      throw new Error('User not found')
    }
    return user.subscriptions
  }

  /**
   * Deactivate account
   */
  async deactivateAccount (userId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    )

    if (!user) {
      throw new Error('User not found')
    }

    return { message: 'Account deactivated' }
  }

  /**
   * Delete account (GDPR right to erasure)
   */
  async deleteAccount (userId) {
    const user = await User.findByIdAndDelete(userId)

    if (!user) {
      throw new Error('User not found')
    }

    // In production, also delete related data (posts, comments, etc.)
    // or anonymize them based on policy

    return { message: 'Account deleted' }
  }

  /**
   * Search users (admin function)
   */
  async searchUsers (query, options = {}) {
    const { page = 1, limit = 20, role, isActive } = options

    const filter = {}

    if (query) {
      filter.$or = [
        { firstName: new RegExp(query, 'i') },
        { lastName: new RegExp(query, 'i') },
        { email: new RegExp(query, 'i') }
      ]
    }

    if (role) filter.role = role
    if (isActive !== undefined) filter.isActive = isActive

    const users = await User.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })

    const total = await User.countDocuments(filter)

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * Update user role (admin function)
   */
  async updateUserRole (userId, role) {
    const validRoles = ['citizen', 'staff', 'admin']
    if (!validRoles.includes(role)) {
      throw new Error('Invalid role')
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    )

    if (!user) {
      throw new Error('User not found')
    }

    return user
  }
}

export default new UserService()
