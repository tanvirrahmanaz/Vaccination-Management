import axios from 'axios'
import { appConfig } from '../config'

const API_BASE = appConfig.apiBase

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
})

const STORAGE_KEY = 'vms_tokens'

export const saveTokens = (tokens) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
}

export const getTokens = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

export const clearTokens = () => {
  localStorage.removeItem(STORAGE_KEY)
}

api.interceptors.request.use((config) => {
  const { access } = getTokens()
  if (access) {
    config.headers.Authorization = `Bearer ${access}`
  }
  return config
})

let refreshing = false
let queue = []

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      if (refreshing) {
        await new Promise((resolve) => queue.push(resolve))
      } else {
        refreshing = true
        try {
          const { refresh } = getTokens()
          if (!refresh) throw new Error('Missing refresh token')
          const refreshResponse = await axios.post(`${API_BASE}/api/auth/token/refresh/`, { refresh })
          saveTokens({ access: refreshResponse.data.access, refresh })
        } catch (refreshError) {
          console.error('Token refresh failed', refreshError)
          clearTokens()
          refreshing = false
          queue.forEach((resolve) => resolve())
          queue = []
          return Promise.reject(error)
        }
        refreshing = false
        queue.forEach((resolve) => resolve())
        queue = []
      }

      const { access } = getTokens()
      if (access) {
        originalRequest.headers.Authorization = `Bearer ${access}`
      }
      return api(originalRequest)
    }
    return Promise.reject(error)
  },
)
