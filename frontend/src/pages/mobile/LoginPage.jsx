import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { login } from '../../api/auth'

const formContainerStyle = {
  background: '#fff',
  borderRadius: 12,
  padding: '40px 32px',
  width: '100%',
  maxWidth: 400,
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
}

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login: handleLogin } = useContext(AuthContext)
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await login(username, password)
      handleLogin(res.data.data)
      navigate('/mobile/home', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || '登录失败，请检查用户名和密码')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={formContainerStyle}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', fontSize: 32,
        }}>
          🐾
        </div>
        <h2 style={{ fontSize: 22, color: '#1f2937' }}>用户登录</h2>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 6 }}>宠物健康管理系统</p>
      </div>

      {error && (
        <div style={{
          background: '#FFF3F0', color: '#D32F2F', padding: '10px 14px',
          borderRadius: 8, fontSize: 13, marginBottom: 20,
        }}>
          {error}
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>用户名</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="请输入用户名"
            autoComplete="username"
          />
        </div>
        <div className="form-group">
          <label>密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={submitting}
          style={{ marginTop: 8, height: 44, fontSize: 15 }}
        >
          {submitting ? '登录中...' : '登录'}
        </button>
      </form>

      <div style={{
        display: 'flex', justifyContent: 'space-between',
        marginTop: 20, fontSize: 13,
      }}>
        <Link to="/auth/register" style={{ color: 'var(--primary)' }}>注册账号</Link>
        <Link to="/auth/admin/login" style={{ color: 'var(--text-hint)' }}>管理员登录</Link>
      </div>
    </div>
  )
}
