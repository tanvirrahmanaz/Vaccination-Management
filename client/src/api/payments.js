import { api } from './client'

export const listPayments = async (params = {}) => {
  const response = await api.get('/payments/payments/', { params })
  return response.data
}

export const getPayment = async (id) => {
  const response = await api.get(`/payments/payments/${id}/`)
  return response.data
}

export const requestPaymentRefund = async (id, payload = {}) => {
  const response = await api.post(`/payments/payments/${id}/request_refund/`, payload)
  return response.data
}

export const cancelPayment = async (payload = {}) => {
  const response = await api.post('/payments/payments/cancel/', payload)
  return response.data
}

export const markPaymentFailed = async (payload = {}) => {
  const response = await api.post('/payments/payments/fail/', payload)
  return response.data
}

export const initiatePayment = async (payload = {}) => {
  const response = await api.post('/payments/payments/initiate_payment/', payload)
  return response.data
}

export const handlePaymentIpn = async (payload = {}) => {
  const response = await api.post('/payments/payments/ipn/', payload)
  return response.data
}

export const markPaymentSuccess = async (payload = {}) => {
  const response = await api.post('/payments/payments/success/', payload)
  return response.data
}

export const listRefunds = async (params = {}) => {
  const response = await api.get('/payments/refunds/', { params })
  return response.data
}

export const getRefund = async (id) => {
  const response = await api.get(`/payments/refunds/${id}/`)
  return response.data
}
