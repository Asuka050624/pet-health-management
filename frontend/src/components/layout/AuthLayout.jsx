import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
      padding: 20,
    }}>
      <Outlet />
    </div>
  )
}
