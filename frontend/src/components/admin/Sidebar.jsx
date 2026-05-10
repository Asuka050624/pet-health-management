import { useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'

const sidebarStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  bottom: 0,
  background: '#1a1a2e',
  color: '#eee',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 1100,
  transition: 'width 0.3s',
}

const menuItems = [
  { to: '/admin', icon: '📊', label: '仪表盘' },
  { to: '/admin/users', icon: '👥', label: '用户管理' },
  { to: '/admin/pets', icon: '🐾', label: '宠物管理' },
  { to: '/admin/products', icon: '📦', label: '商品管理' },
  { to: '/admin/orders', icon: '💳', label: '订单管理' },
  { to: '/admin/reservations', icon: '📅', label: '预约管理' },
  { to: '/admin/news', icon: '📰', label: '资讯管理' },
  { to: '/admin/feedback', icon: '💬', label: '反馈管理' },
  { to: '/admin/settings', icon: '⚙️', label: '系统设置' },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { logout, user } = useContext(AuthContext)
  const navigate = useNavigate()
  const width = collapsed ? 64 : 240

  const handleLogout = () => {
    logout()
    navigate('/auth/admin/login')
  }

  return (
    <aside style={{ ...sidebarStyle, width }}>
      <div style={{
        padding: collapsed ? '16px 8px' : '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
      }}>
        {!collapsed && (
          <div>
            <h2 style={{ fontSize: 16, margin: 0 }}>管理后台</h2>
            <p style={{ fontSize: 11, color: '#888', margin: '4px 0 0' }}>宠物健康管理系统</p>
          </div>
        )}
        <button onClick={onToggle} style={{
          background: 'none', border: 'none', color: '#888',
          fontSize: 18, cursor: 'pointer', padding: 4,
        }}>
          {collapsed ? '☰' : '✕'}
        </button>
      </div>

      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: collapsed ? '12px 0' : '12px 20px',
              color: isActive ? '#4CAF50' : '#aaa',
              background: isActive ? 'rgba(76,175,80,0.1)' : 'transparent',
              borderRight: isActive ? '3px solid #4CAF50' : '3px solid transparent',
              justifyContent: collapsed ? 'center' : 'flex-start',
              fontSize: 14,
              transition: 'all 0.2s',
            })}
          >
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div style={{
        padding: collapsed ? '12px 8px' : '12px 20px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}>
        {!collapsed && (
          <p style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{user?.username}</p>
        )}
        <button onClick={handleLogout} style={{
          width: '100%',
          padding: '8px',
          background: 'rgba(244,67,54,0.15)',
          color: '#F44336',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 12,
        }}>
          {collapsed ? '🚪' : '退出登录'}
        </button>
      </div>
    </aside>
  )
}
