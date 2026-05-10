import { Outlet } from 'react-router-dom'
import BottomNav from '../mobile/BottomNav'

export default function MobileLayout() {
  return (
    <div style={{
      maxWidth: 'var(--mobile-max-width)',
      margin: '0 auto',
      minHeight: '100vh',
      background: 'var(--bg)',
      paddingBottom: 'var(--bottom-nav-height)',
    }}>
      <div style={{ padding: 16, minHeight: 'calc(100vh - var(--bottom-nav-height))' }}>
        <Outlet />
      </div>
      <BottomNav />
    </div>
  )
}
