/**
 * Socket Service
 * Real-time notifications with Socket.io
 */
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

class SocketService {
  socket = null

  connect(userId) {
    if (this.socket?.connected) return

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    })

    this.socket.on('connect', () => {
      console.log('Socket connected')
      if (userId) {
        this.socket.emit('join', userId)
      }
    })

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  subscribe(topic) {
    if (this.socket) {
      this.socket.emit('subscribe', topic)
    }
  }

  unsubscribe(topic) {
    if (this.socket) {
      this.socket.emit('unsubscribe', topic)
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }
}

export default new SocketService()
