/**
 * Notification Store - Zustand
 */
import { create } from 'zustand'
import api from '../services/api'

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  // Fetch notifications
  fetchNotifications: async () => {
    set({ isLoading: true })
    try {
      const response = await api.get('/notifications')
      set({
        notifications: response.data.notifications,
        unreadCount: response.data.unreadCount,
        isLoading: false
      })
    } catch (error) {
      set({ isLoading: false })
    }
  },

  // Add notification (from socket)
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }))
  },

  // Mark as read
  markAsRead: async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`)
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }))
    } catch (error) {
      console.error('Failed to mark notification as read')
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    try {
      await api.put('/notifications/read-all')
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0
      }))
    } catch (error) {
      console.error('Failed to mark all notifications as read')
    }
  },

  // Clear notifications
  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 })
  }
}))

export default useNotificationStore
