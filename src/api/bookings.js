import { api } from './client'

export const listBookings = async (params = {}) => {
  const response = await api.get('/bookings/', { params })
  return response.data
}

export const getBooking = async (id) => {
  const response = await api.get(`/bookings/${id}/`)
  return response.data
}

export const createBooking = async (payload) => {
  const response = await api.post('/bookings/', payload)
  return response.data
}

export const updateBooking = async (id, payload) => {
  const response = await api.patch(`/bookings/${id}/`, payload)
  return response.data
}

export const deleteBooking = async (id) => {
  const response = await api.delete(`/bookings/${id}/`)
  return response.data
}
