import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { register } from '../../api/auth'

const formContainerStyle = {
  background: '#fff',
  borderRadius: 12,
  padding: '40px 32px',
  width: '100%',
  maxWidth: 400,
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
}

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login: handleLogin } = useContext(AuthContext)
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !phone.trim() || !password.trim()) {
      setError('请填写所有必填字段')
      return
    }
    if (password.length < 6) {
      setError('密码长度不能少于6位')
      return
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await register({ username, phone, email, password })
      handleLogin(res.data.data)
      navigate('/mobile/home', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || '注册失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={formContainerStyle}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, color: '#1f2937' }}>注册账号</h2>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 6 }}>加入宠物健康管理系统</p>
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
          <label>用户名 *</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="请输入用户名" />
        </div>
        <div className="form-group">
          <label>手机号 *</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="请输入手机号" />
        </div>
        <div className="form-group">
          <label>邮箱</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="请输入邮箱（选填）" />
        </div>
        <div className="form-group">
          <label>密码 *</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="至少6位密码" />
        </div>
        <div className="form-group">
          <label>确认密码 *</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="再次输入密码" />
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting} style={{ marginTop: 8, height: 44, fontSize: 15 }}>
          {submitting ? '注册中...' : '注册'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13 }}>
        <span style={{ color: 'var(--text-hint)' }}>已有账号？</span>{' '}
        <Link to="/auth/login" style={{ color: 'var(--primary)' }}>立即登录</Link>
      </div>
    </div>
  )
}
