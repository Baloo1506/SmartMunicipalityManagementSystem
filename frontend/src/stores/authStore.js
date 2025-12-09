/**
 * Auth Store - Zustand
 * Manages authentication state
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login
      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/login', { email, password })
          const { user, token } = response.data.data

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          })

          // Set token in API headers
          api.defaults.headers.common.Authorization = `Bearer ${token}`

          return { success: true }
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.error || 'Login failed'
          })
          return { success: false, error: error.response?.data?.error }
        }
      },

      // Register
      register: async (userData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/register', userData)
          const { user, token } = response.data.data

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          })

          api.defaults.headers.common.Authorization = `Bearer ${token}`

          return { success: true }
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.error || 'Registration failed'
          })
          return { success: false, error: error.response?.data?.error }
        }
      },

      // Logout
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        })
        delete api.defaults.headers.common.Authorization
      },

      // Update user profile
      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData }
        }))
      },

      // Initialize auth from storage
      initAuth: () => {
        const { token } = get()
        if (token) {
          api.defaults.headers.common.Authorization = `Bearer ${token}`
        }
      },

      // Clear error
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

export default useAuthStore
