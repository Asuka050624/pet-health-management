import { createContext, useState, useEffect, useCallback } from 'react'
import * as authApi from '../api/auth'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = !!user
  const isAdmin = user?.role === 'admin'

  const restoreSession = useCallback(async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const role = localStorage.getItem('role')
      if (role === 'admin') {
        const { data } = await authApi.getAdminMe()
        setUser(data.data)
      } else {
        const { data } = await authApi.getMe()
        setUser(data.data)
      }
    } catch {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('role')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  const handleLogin = useCallback((data) => {
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    localStorage.setItem('role', data.user.role || 'user')
    setUser(data.user)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('role')
    setUser(null)
  }, [])

  const updateProfile = useCallback((updatedUser) => {
    setUser(updatedUser)
  }, [])

  return (
    <AuthContext.Provider value={{
      user, loading, isAuthenticated, isAdmin,
      login: handleLogin, logout, updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
