import { useState, useEffect } from 'react'
import { getDashboardStats } from '../../api/admin'
import StatCard from '../../components/admin/StatCard'

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats()
      .then(({ data }) => setStats(data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const refresh = () => {
    setLoading(true)
    getDashboardStats()
      .then(({ data }) => setStats(data.data))
      .finally(() => setLoading(false))
  }

  if (loading) return <div className="spinner" />

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 22 }}>仪表盘</h2>
        <button className="btn btn-outline btn-sm" onClick={refresh}>刷新</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard icon="👥" label="注册用户" value={stats?.total_users || 0} color="blue" />
        <StatCard icon="🐾" label="宠物数量" value={stats?.total_pets || 0} color="green" />
        <StatCard icon="📦" label="商品数量" value={stats?.total_products || 0} color="purple" />
        <StatCard icon="📅" label="今日预约" value={stats?.today_reservations || 0} color="teal" />
        <StatCard icon="📋" label="待确认预约" value={stats?.pending_reservations || 0} color="orange" />
        <StatCard icon="💳" label="待处理订单" value={stats?.pending_orders || 0} color="orange" />
        <StatCard icon="💬" label="未读反馈" value={stats?.unread_feedback || 0} color="red" />
        <StatCard icon="📰" label="资讯数量" value={stats?.total_news || 0} color="blue" />
      </div>

      <div className="card">
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>快捷操作</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {[
            { label: '商品管理', to: '/admin/products', icon: '📦' },
            { label: '订单管理', to: '/admin/orders', icon: '💳' },
            { label: '预约管理', to: '/admin/reservations', icon: '📅' },
            { label: '反馈管理', to: '/admin/feedback', icon: '💬' },
            { label: '资讯管理', to: '/admin/news', icon: '📰' },
            { label: '用户管理', to: '/admin/users', icon: '👥' },
          ].map((action) => (
            <a key={action.to} href={action.to} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: 14, background: '#f8f9fa', borderRadius: 8, fontSize: 14,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={(e) => e.target.style.background = '#4CAF50'}
              onMouseLeave={(e) => e.target.style.background = '#f8f9fa'}
              onMouseEnterCapture={(e) => e.target.style.color = '#fff'}
              onMouseLeaveCapture={(e) => e.target.style.color = 'inherit'}
            >
              <span style={{ fontSize: 20 }}>{action.icon}</span>
              <span>{action.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
