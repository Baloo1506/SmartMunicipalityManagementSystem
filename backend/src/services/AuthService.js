/**
 * Auth Service
 * Handles authentication, registration, and password management
 */
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '../models/User.js'

class AuthService {
  /**
   * Generate JWT token
   */
  generateToken (userId) {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET || 'default-secret-change-in-production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )
  }

  /**
   * Verify JWT token
   */
  verifyToken (token) {
    return jwt.verify(token, process.env.JWT_SECRET || 'default-secret-change-in-production')
  }

  /**
   * Register a new user
   */
  async register (userData) {
    const { email, password, firstName, lastName, preferences } = userData

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      throw new Error('Email already registered')
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      preferences,
      verificationToken,
      gdprConsent: {
        given: userData.gdprConsent || false,
        date: userData.gdprConsent ? new Date() : null
      }
    })

    const token = this.generateToken(user._id)

    return {
      user: user.toJSON(),
      token,
      verificationToken
    }
  }

  /**
   * Login user
   */
  async login (email, password) {
    // Find user with password
    const user = await User.findOne({ email }).select('+password')

    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid email or password')
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated')
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    const token = this.generateToken(user._id)

    return {
      user: user.toJSON(),
      token
    }
  }

  /**
   * Verify email
   */
  async verifyEmail (token) {
    const user = await User.findOne({ verificationToken: token })

    if (!user) {
      throw new Error('Invalid verification token')
    }

    user.isVerified = true
    user.verificationToken = undefined
    await user.save()

    return user.toJSON()
  }

  /**
   * Request password reset
   */
  async requestPasswordReset (email) {
    const user = await User.findOne({ email })

    if (!user) {
      // Don't reveal if email exists
      return { message: 'If email exists, reset instructions sent' }
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    user.resetPasswordExpires = Date.now() + 3600000 // 1 hour
    await user.save()

    return { resetToken }
  }

  /**
   * Reset password
   */
  async resetPassword (token, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    })

    if (!user) {
      throw new Error('Invalid or expired reset token')
    }

    user.password = newPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    return { message: 'Password reset successful' }
  }

  /**
   * Change password (authenticated)
   */
  async changePassword (userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password')

    if (!user || !(await user.comparePassword(currentPassword))) {
      throw new Error('Current password is incorrect')
    }

    user.password = newPassword
    await user.save()

    return { message: 'Password changed successfully' }
  }
}

export default new AuthService()
