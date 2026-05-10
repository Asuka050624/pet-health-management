import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { formatDate } from '../../utils/formatters'

const menuItems = [
  { key: 'pets', icon: '🐾', label: '我的宠物', to: '/mobile/user/pets' },
  { key: 'orders', icon: '📋', label: '我的订单', to: '/mobile/user/orders' },
  { key: 'messages', icon: '💬', label: '消息中心', to: '/mobile/user/messages' },
  { key: 'profile', icon: '👤', label: '个人信息', to: '/mobile/user/profile' },
  { key: 'logout', icon: '🚪', label: '退出登录', to: null },
]

export default function UserCenterPage() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleMenuClick = (item) => {
    if (item.key === 'logout') {
      logout()
      navigate('/auth/login', { replace: true })
    } else {
      navigate(item.to)
    }
  }

  if (!user) {
    navigate('/auth/login', { replace: true })
    return null
  }

  return (
    <div>
      {/* Avatar and Info Section */}
      <div style={{
        background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 24px',
        color: '#fff',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          flexShrink: 0,
        }}>
          {user.avatar || '🐱'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: 18, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.username || '用户'}
          </h3>
          <p style={{ fontSize: 12, opacity: 0.85, marginBottom: 2 }}>
            积分：{user.points ?? 0}
          </p>
          <p style={{ fontSize: 12, opacity: 0.75, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            邮箱：{user.email || '未绑定'}
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginBottom: 20,
      }}>
        {[
          { label: '我的宠物', value: user.pet_count ?? 0, to: '/mobile/user/pets' },
          { label: '订单', value: user.order_count ?? 0, to: '/mobile/user/orders' },
          { label: '消息', value: user.unread_count ?? 0, to: '/mobile/user/messages' },
        ].map((stat) => (
          <div
            key={stat.label}
            onClick={() => navigate(stat.to)}
            style={{
              flex: 1,
              background: 'var(--bg-white)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow)',
              padding: '16px 12px',
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Menu List */}
      <div style={{
        background: 'var(--bg-white)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow)',
        overflow: 'hidden',
      }}>
        {menuItems.map((item, index) => (
          <div
            key={item.key}
            onClick={() => handleMenuClick(item)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              cursor: 'pointer',
              borderBottom: index < menuItems.length - 1 ? '1px solid var(--border)' : 'none',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 15, color: 'var(--text-primary)' }}>{item.label}</span>
            </div>
            {item.key !== 'logout' && (
              <span style={{ fontSize: 16, color: 'var(--text-hint)' }}>›</span>
            )}
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div style={{
        textAlign: 'center',
        padding: '24px 0',
        fontSize: 12,
        color: 'var(--text-hint)',
      }}>
        <p>注册时间：{formatDate(user.created_at) || '--'}</p>
      </div>
    </div>
  )
}
