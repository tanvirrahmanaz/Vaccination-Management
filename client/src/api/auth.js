import { api, saveTokens, clearTokens, getTokens } from './client'

export async function login(credentials) {
  const response = await api.post('/auth/token/', credentials)
  saveTokens({ access: response.data.access, refresh: response.data.refresh })
  return response.data
}

export const refreshToken = async (payload) => {
  const response = await api.post('/auth/token/refresh/', payload)
  if (response.data.access && payload.refresh) {
    saveTokens({ access: response.data.access, refresh: payload.refresh })
  }
  return response.data
}

export const loginUser = async (payload) => {
  const response = await api.post('/auth/users/login/', payload)
  if (response.data.access && response.data.refresh) {
    saveTokens({ access: response.data.access, refresh: response.data.refresh })
  }
  return response.data
}

export function logout() {
  clearTokens()
}

export function hasSession() {
  const { access } = getTokens()
  return Boolean(access)
}

export const getProfile = async () => {
  const response = await api.get('/auth/profile/')
  return response.data
}

export const replaceProfile = async (payload) => {
  const response = await api.put('/auth/profile/', payload)
  return response.data
}

export const updateProfile = async (payload) => {
  const response = await api.patch('/auth/profile/', payload)
  return response.data
}

export const changePassword = async (payload) => {
  const response = await api.put('/auth/change-password/', payload)
  return response.data
}

export const changePasswordPartial = async (payload) => {
  const response = await api.patch('/auth/change-password/', payload)
  return response.data
}

export const listUsers = async (params = {}) => {
  const response = await api.get('/auth/users/', { params })
  return response.data
}

export const createUser = async (payload) => {
  const response = await api.post('/auth/users/', payload)
  return response.data
}

export const getUser = async (id) => {
  const response = await api.get(`/auth/users/${id}/`)
  return response.data
}

export const replaceUser = async (id, payload) => {
  const response = await api.put(`/auth/users/${id}/`, payload)
  return response.data
}

export const updateUser = async (id, payload) => {
  const response = await api.patch(`/auth/users/${id}/`, payload)
  return response.data
}

export const deleteUser = async (id) => {
  const response = await api.delete(`/auth/users/${id}/`)
  return response.data
}

export const register = async (payload) => {
  const response = await api.post('/auth/users/register/', payload)
  if (response.data.access && response.data.refresh) {
    saveTokens({ access: response.data.access, refresh: response.data.refresh })
  }
  return response.data
}
