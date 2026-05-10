import { createContext, useState, useCallback, useContext, useEffect } from 'react'
import { AuthContext } from './AuthContext'
import api from '../api/axios'

export const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { isAuthenticated } = useContext(AuthContext)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      const local = JSON.parse(localStorage.getItem('cart') || '[]')
      setItems(local)
      return
    }
    setLoading(true)
    try {
      const { data } = await api.get('/cart')
      setItems(data.data || [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const addToCart = useCallback(async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      setItems((prev) => {
        const existing = prev.find((i) => i.product_id === productId || i.id === productId)
        if (existing) {
          return prev.map((i) =>
            (i.product_id === productId || i.id === productId)
              ? { ...i, quantity: i.quantity + quantity }
              : i
          )
        }
        return [...prev, { product_id: productId, id: productId, quantity, price: 0, name: '' }]
      })
      return
    }
    try {
      await api.post('/cart', { product_id: productId, quantity })
      await fetchCart()
    } catch (err) {
      throw err
    }
  }, [isAuthenticated, fetchCart])

  const updateQuantity = useCallback(async (productId, quantity) => {
    if (!isAuthenticated) {
      setItems((prev) =>
        prev.map((i) =>
          (i.product_id === productId || i.id === productId)
            ? { ...i, quantity: Math.max(1, quantity) }
            : i
        )
      )
      return
    }
    await api.put(`/cart/${productId}`, { quantity })
    await fetchCart()
  }, [isAuthenticated, fetchCart])

  const removeFromCart = useCallback(async (productId) => {
    if (!isAuthenticated) {
      setItems((prev) => prev.filter((i) => (i.product_id || i.id) !== productId))
      return
    }
    await api.delete(`/cart/${productId}`)
    await fetchCart()
  }, [isAuthenticated, fetchCart])

  const clearCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([])
      localStorage.setItem('cart', '[]')
      return
    }
    // Clear items one by one
    for (const item of items) {
      const pid = item.product_id || item.id
      await api.delete(`/cart/${pid}`)
    }
    setItems([])
  }, [isAuthenticated, items])

  return (
    <CartContext.Provider value={{
      items, loading, totalCount, totalPrice,
      addToCart, updateQuantity, removeFromCart, clearCart, fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}
