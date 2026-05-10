import api from './axios'

export const getFeedbacks = (params) => api.get('/feedbacks', { params })
export const createFeedback = (data) => api.post('/feedbacks', data)
