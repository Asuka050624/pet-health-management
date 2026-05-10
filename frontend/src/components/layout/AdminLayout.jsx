import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../admin/Sidebar'

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main style={{
        flex: 1,
        marginLeft: collapsed ? 64 : 'var(--sidebar-width)',
        transition: 'margin-left 0.3s',
        padding: 24,
        background: 'var(--bg)',
        minHeight: '100vh',
      }}>
        <Outlet />
      </main>
    </div>
  )
}
