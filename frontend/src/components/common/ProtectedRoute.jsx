import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import Loading from './Loading'

export function UserRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useContext(AuthContext)

  if (loading) return <Loading />
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />
  if (isAdmin) return <Navigate to="/admin" replace />
  return children
}

export function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useContext(AuthContext)

  if (loading) return <Loading />
  if (!isAuthenticated) return <Navigate to="/auth/admin/login" replace />
  if (!isAdmin) return <Navigate to="/mobile/home" replace />
  return children
}

export function GuestRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useContext(AuthContext)

  if (loading) return <Loading />
  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin' : '/mobile/home'} replace />
  }
  return children
}
