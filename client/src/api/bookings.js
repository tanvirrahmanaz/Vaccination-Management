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

export const replaceBooking = async (id, payload) => {
  const response = await api.put(`/bookings/${id}/`, payload)
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

export const initiateBookingPayment = async (id, payload = {}) => {
  const response = await api.post(`/bookings/${id}/initiate_payment/`, payload)
  return response.data
}

export const upgradeBookingToPriority = async (id, payload = {}) => {
  const response = await api.post(`/bookings/${id}/upgrade_to_priority/`, payload)
  return response.data
}

export const getBookingStats = async (params = {}) => {
  const response = await api.get('/bookings/booking_stats/', { params })
  return response.data
}

export const createPremiumBooking = async (payload) => {
  const response = await api.post('/bookings/create_premium_booking/', payload)
  return response.data
}

export const listMyBookingPayments = async (params = {}) => {
  const response = await api.get('/bookings/my_payments/', { params })
  return response.data
}

export const listPendingBookingPayments = async (params = {}) => {
  const response = await api.get('/bookings/pending_payments/', { params })
  return response.data
}
