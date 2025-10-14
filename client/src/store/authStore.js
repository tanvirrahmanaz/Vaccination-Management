import { create } from 'zustand'
import { getProfile, login as loginRequest, logout as logoutRequest, hasSession } from '../api/auth'

export const useAuthStore = create((set) => ({
  user: null,
  status: 'idle',
  error: null,

  initialize: async () => {
    if (!hasSession()) {
      set({ user: null, status: 'anonymous' })
      return
    }
    set({ status: 'loading', error: null })
    try {
      const profile = await getProfile()
      set({ user: profile, status: 'authenticated' })
    } catch (error) {
      console.error('Session initialization failed', error)
      logoutRequest()
      set({ user: null, status: 'anonymous', error: 'Session expired. Please log in again.' })
    }
  },

  login: async (credentials) => {
    set({ status: 'loading', error: null })
    try {
      await loginRequest(credentials)
      const profile = await getProfile()
      set({ user: profile, status: 'authenticated' })
      return profile
    } catch (error) {
      const message = error.response?.data?.detail || 'Unable to sign in with those credentials.'
      set({ status: 'error', error: message })
      throw error
    }
  },

  logout: () => {
    logoutRequest()
    set({ user: null, status: 'anonymous', error: null })
  },
}))
