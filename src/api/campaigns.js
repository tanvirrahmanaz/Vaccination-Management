import { api } from './client'

export const listCampaigns = async (params = {}) => {
  const response = await api.get('/campaigns/', { params })
  return response.data
}

export const getCampaign = async (id) => {
  const response = await api.get(`/campaigns/${id}/`)
  return response.data
}

export const createCampaign = async (payload) => {
  const response = await api.post('/campaigns/', payload)
  return response.data
}

export const updateCampaign = async (id, payload) => {
  const response = await api.patch(`/campaigns/${id}/`, payload)
  return response.data
}

export const deleteCampaign = async (id) => {
  const response = await api.delete(`/campaigns/${id}/`)
  return response.data
}
