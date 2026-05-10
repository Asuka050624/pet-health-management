import api from './axios'

export const getMessages = (params) => api.get('/messages', { params })
export const markAsRead = (id) => api.put(`/messages/${id}/read`)
