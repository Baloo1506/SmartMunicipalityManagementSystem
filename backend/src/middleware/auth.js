/**
 * Authentication Middleware
 * Handles JWT verification and role-based access
 */
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

/**
 * Protect routes - require authentication
 */
export const protect = async (req, res, next) => {
  try {
    let token

    // Get token from header
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized - no token provided'
      })
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default-secret-change-in-production'
    )

    // Get user
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      })
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized - invalid token'
    })
  }
}

/**
 * Optional authentication - attach user if token present
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'default-secret-change-in-production'
      )
      req.user = await User.findById(decoded.id)
    }

    next()
  } catch (error) {
    // Token invalid but continue without user
    next()
  }
}

/**
 * Restrict to specific roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Role '${req.user.role}' is not authorized to access this resource`
      })
    }
    next()
  }
}

/**
 * Check if user is admin
 */
export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    })
  }
  next()
}

/**
 * Check if user is staff or admin
 */
export const isStaffOrAdmin = (req, res, next) => {
  if (!['staff', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Staff or admin access required'
    })
  }
  next()
}
