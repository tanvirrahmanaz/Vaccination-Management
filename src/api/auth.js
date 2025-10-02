import { api, saveTokens, clearTokens, getTokens } from './client'

export async function login(credentials) {
  const response = await api.post('/auth/token/', credentials)
  saveTokens({ access: response.data.access, refresh: response.data.refresh })
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

export const updateProfile = async (payload) => {
  const response = await api.patch('/auth/profile/', payload)
  return response.data
}

export const changePassword = async (payload) => {
  const response = await api.put('/auth/change-password/', payload)
  return response.data
}

export const listUsers = async () => {
  const response = await api.get('/auth/users/')
  return response.data
}

export const register = async (payload) => {
  const response = await api.post('/auth/users/register/', payload)
  return response.data
}
