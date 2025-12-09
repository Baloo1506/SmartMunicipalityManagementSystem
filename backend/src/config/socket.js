/**
 * Socket.io Configuration
 * Real-time notifications and updates
 */
import { Server } from 'socket.io'

let io

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket) => {
    console.log(`🔗 User connected: ${socket.id}`)

    // Join user to their personal room for notifications
    socket.on('join', (userId) => {
      socket.join(`user:${userId}`)
      console.log(`User ${userId} joined their notification room`)
    })

    // Join topic/category rooms for subscriptions
    socket.on('subscribe', (topic) => {
      socket.join(`topic:${topic}`)
      console.log(`Socket ${socket.id} subscribed to topic: ${topic}`)
    })

    socket.on('unsubscribe', (topic) => {
      socket.leave(`topic:${topic}`)
      console.log(`Socket ${socket.id} unsubscribed from topic: ${topic}`)
    })

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.id}`)
    })
  })

  return io
}

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized')
  }
  return io
}

// Emit notification to specific user
export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data)
  }
}

// Emit notification to all subscribers of a topic
export const emitToTopic = (topic, event, data) => {
  if (io) {
    io.to(`topic:${topic}`).emit(event, data)
  }
}

// Broadcast to all connected users
export const broadcast = (event, data) => {
  if (io) {
    io.emit(event, data)
  }
}
