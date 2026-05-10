import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'

export default function SettingsPage() {
  const { user } = useContext(AuthContext)

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 20 }}>系统设置</h2>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>管理员信息</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px 16px', fontSize: 14 }}>
          <span style={{ color: 'var(--text-hint)' }}>用户名</span><span>{user?.username}</span>
          <span style={{ color: 'var(--text-hint)' }}>角色</span><span>{user?.role === 'super' ? '超级管理员' : '运营人员'}</span>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>系统信息</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px 16px', fontSize: 14 }}>
          <span style={{ color: 'var(--text-hint)' }}>系统名称</span><span>宠物健康管理系统</span>
          <span style={{ color: 'var(--text-hint)' }}>版本</span><span>2.0.0</span>
          <span style={{ color: 'var(--text-hint)' }}>技术栈</span><span>Flask + React + MySQL</span>
        </div>
      </div>
    </div>
  )
}
