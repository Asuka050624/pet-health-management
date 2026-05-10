import { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'

const navStyle = {
  position: 'fixed',
  bottom: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  maxWidth: 'var(--mobile-max-width)',
  width: '100%',
  height: 'var(--bottom-nav-height)',
  background: 'var(--bg-white)',
  borderTop: '1px solid var(--border)',
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  zIndex: 1000,
}

const linkStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
  fontSize: 10,
  color: 'var(--text-hint)',
  padding: '8px 12px',
}

const activeStyle = {
  ...linkStyle,
  color: 'var(--primary)',
  fontWeight: 600,
}

const navItems = [
  { to: '/mobile/home', icon: '/images/home-active.png', label: '首页' },
  { to: '/mobile/shop', icon: '/images/shop.png', label: '商城' },
  { to: '/mobile/reservation', icon: '/images/reservation.png', label: '预约' },
  { to: '/mobile/news', icon: '/images/news.png', label: '资讯' },
]

export default function BottomNav() {
  const { user } = useContext(AuthContext)

  return (
    <nav style={navStyle}>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          style={({ isActive }) => isActive ? activeStyle : linkStyle}
        >
          <img src={item.icon} alt={item.label} style={{ width: 24, height: 24, objectFit: 'contain' }} />
          <span>{item.label}</span>
        </NavLink>
      ))}
      <NavLink
        to="/mobile/user"
        style={({ isActive }) => isActive ? activeStyle : linkStyle}
      >
        <img src="/images/user.png" alt="我的" style={{ width: 24, height: 24, objectFit: 'contain' }} />
        <span>{user?.username || '我的'}</span>
      </NavLink>
    </nav>
  )
}
