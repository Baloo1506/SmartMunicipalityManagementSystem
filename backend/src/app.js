/**
 * Express App Configuration
 * SMMS - Smart Municipality Management System
 */
import express from 'express'
import cors from 'cors'
import { errorHandler } from './middleware/errorHandler.js'
import { notFound } from './middleware/notFound.js'

// Import Routes
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import postRoutes from './routes/post.routes.js'
import commentRoutes from './routes/comment.routes.js'
import eventRoutes from './routes/event.routes.js'
import notificationRoutes from './routes/notification.routes.js'
import adminRoutes from './routes/admin.routes.js'
import analyticsRoutes from './routes/analytics.routes.js'

const app = express()

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))

// Body Parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health Check
app.get('/health', (_req, res) => res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() }))

// API Info
app.get('/api', (_req, res) => res.json({
  name: 'Smart Municipality Management System API',
  version: '1.0.0',
  endpoints: {
    auth: '/api/auth',
    users: '/api/users',
    posts: '/api/posts',
    comments: '/api/comments',
    events: '/api/events',
    notifications: '/api/notifications',
    admin: '/api/admin',
    analytics: '/api/analytics'
  }
}))

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/analytics', analyticsRoutes)

// Error Handling
app.use(notFound)
app.use(errorHandler)

export default app
