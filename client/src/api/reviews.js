import { api } from './client'

export const listReviews = async (params = {}) => {
  const response = await api.get('/reviews/', { params })
  return response.data
}

export const getReview = async (id) => {
  const response = await api.get(`/reviews/${id}/`)
  return response.data
}

export const createReview = async (payload) => {
  const response = await api.post('/reviews/', payload)
  return response.data
}

export const replaceReview = async (id, payload) => {
  const response = await api.put(`/reviews/${id}/`, payload)
  return response.data
}

export const updateReview = async (id, payload) => {
  const response = await api.patch(`/reviews/${id}/`, payload)
  return response.data
}

export const deleteReview = async (id) => {
  const response = await api.delete(`/reviews/${id}/`)
  return response.data
}
