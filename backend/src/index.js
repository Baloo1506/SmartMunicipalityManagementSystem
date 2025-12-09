/**
 * SMMS Backend Entry Point
 * Smart Municipality Management System
 */
import dotenv from 'dotenv'
import app from './app.js'
import { connectDB } from './config/database.js'
import { initializeSocket } from './config/socket.js'
import http from 'http'

dotenv.config()

const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB()
    console.log('📦 Database connected successfully')

    // Create HTTP server
    const server = http.createServer(app)

    // Initialize Socket.io for real-time notifications
    initializeSocket(server)
    console.log('🔌 Socket.io initialized')

    // Start listening
    server.listen(PORT, () => {
      console.log(`🚀 SMMS Backend running on http://localhost:${PORT}`)
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
