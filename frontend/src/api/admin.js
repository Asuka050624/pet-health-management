import api from './axios'

export const getDashboardStats = () => api.get('/admin/dashboard/stats')

export const getUsers = (params) => api.get('/admin/users', { params })
export const getUser = (id) => api.get(`/admin/users/${id}`)

export const getAllPets = (params) => api.get('/admin/pets', { params })

export const getAdminProducts = (params) => api.get('/admin/products', { params })
export const createProduct = (data) => api.post('/admin/products', data)
export const updateProduct = (id, data) => api.put(`/admin/products/${id}`, data)
export const deleteProduct = (id) => api.delete(`/admin/products/${id}`)

export const getAdminOrders = (params) => api.get('/admin/orders', { params })
export const updateOrderStatus = (id, status) => api.put(`/admin/orders/${id}/status`, { status })

export const getAdminReservations = (params) => api.get('/admin/reservations', { params })
export const updateReservationStatus = (id, status) => api.put(`/admin/reservations/${id}/status`, { status })

export const getAdminFeedbacks = (params) => api.get('/admin/feedbacks', { params })
export const replyFeedback = (id, reply) => api.put(`/admin/feedbacks/${id}/reply`, { reply })

export const getAdminNews = (params) => api.get('/admin/news', { params })
export const createNews = (data) => api.post('/admin/news', data)
export const updateNews = (id, data) => api.put(`/admin/news/${id}`, data)
export const deleteNews = (id) => api.delete(`/admin/news/${id}`)
