import api from './axios'

export const getNewsList = (params) => api.get('/news', { params })
export const getNewsDetail = (id) => api.get(`/news/${id}`)
export const getNewsComments = (id) => api.get(`/news/${id}/comments`)
export const addNewsComment = (id, content) => api.post(`/news/${id}/comments`, { content })
