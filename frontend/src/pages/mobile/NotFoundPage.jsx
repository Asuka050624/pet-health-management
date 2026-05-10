import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
      <h2 style={{ marginBottom: 8 }}>页面未找到</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>请检查网址是否正确</p>
      <Link to="/mobile/home" className="btn btn-primary">返回首页</Link>
    </div>
  )
}
