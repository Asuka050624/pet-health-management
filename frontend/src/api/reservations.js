import api from './axios'

export const getReservations = (params) => api.get('/reservations', { params })
export const createReservation = (data) => api.post('/reservations', data)
export const cancelReservation = (id) => api.put(`/reservations/${id}/cancel`)
