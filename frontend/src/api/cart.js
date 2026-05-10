import api from './axios'

export const getCart = () => api.get('/cart')
export const addToCart = (productId, quantity = 1) => api.post('/cart', { product_id: productId, quantity })
export const updateCartItem = (productId, quantity) => api.put(`/cart/${productId}`, { quantity })
export const removeFromCart = (productId) => api.delete(`/cart/${productId}`)
