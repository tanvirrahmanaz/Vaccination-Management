import { api } from './client'

export const listPremiumServices = async (params = {}) => {
  const response = await api.get('/premium-services/', { params })
  return response.data
}

export const getPremiumService = async (id) => {
  const response = await api.get(`/premium-services/${id}/`)
  return response.data
}
