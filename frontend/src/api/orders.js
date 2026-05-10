import api from './axios'

export const getOrders = (params) => api.get('/orders', { params })
export const createOrder = (paymentMethod) => api.post('/orders', { payment_method: paymentMethod })
export const getOrder = (id) => api.get(`/orders/${id}`)
export const cancelOrder = (id) => api.put(`/orders/${id}/cancel`)
