import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { useToast } from '../../components/common/Toast'
import api from '../../api/axios'

export default function PersonalInfoPage() {
  const { user, updateProfile } = useContext(AuthContext)
  const navigate = useNavigate()
  const showToast = useToast()

  const [form, setForm] = useState({
    username: '',
    phone: '',
    email: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/auth/login', { replace: true })
      return
    }
    setForm({
      username: user.username || '',
      phone: user.phone || '',
      email: user.email || '',
    })
  }, [user, navigate])

  if (!user) return null

  const handleChange = (field) => (e) => {
    setForm((prev) => {
      const next = { ...prev, [field]: e.target.value }
      // Check if changed from original
      if (
        next.username !== (user.username || '') ||
        next.phone !== (user.phone || '') ||
        next.email !== (user.email || '')
      ) {
        setHasChanges(true)
      } else {
        setHasChanges(false)
      }
      return next
    })
    setError('')
  }

  const handleSave = async () => {
    // Basic validation
    if (!form.phone.trim() && !form.email.trim()) {
      setError('请至少填写手机号或邮箱')
      return
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('请输入正确的邮箱地址')
      return
    }
    if (form.phone && !/^1[3-9]\d{9}$/.test(form.phone)) {
      setError('请输入正确的手机号')
      return
    }

    setError('')
    setSaving(true)
    try {
      const { data } = await api.put('/users/profile', {
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
      })
      updateProfile(data.data || data)
      showToast('个人信息已更新')
      setHasChanges(false)
    } catch (err) {
      setError(err.response?.data?.error || '保存失败，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  // Calculate how many days since joined
  const daysSinceJoined = (() => {
    if (!user.created_at) return null
    const created = new Date(user.created_at)
    const now = new Date()
    const diff = Math.floor((now - created) / (1000 * 60 * 60 * 24))
    return diff
  })()

  return (
    <div>
      {/* Page Title */}
      <h2 style={{ fontSize: 18, marginBottom: 20 }}>个人信息</h2>

      {/* Error Message */}
      {error && (
        <div style={{
          background: '#FFF3F0', color: '#D32F2F', padding: '10px 14px',
          borderRadius: 8, fontSize: 13, marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      {/* Avatar Section */}
      <div style={{
        background: 'var(--bg-white)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow)',
        padding: '24px 20px',
        textAlign: 'center',
        marginBottom: 16,
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36,
          margin: '0 auto 12px',
          color: '#fff',
        }}>
          {user.avatar || '🐱'}
        </div>
        <h3 style={{ fontSize: 17, marginBottom: 4 }}>{user.username}</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          角色：{user.role === 'admin' ? '管理员' : '普通用户'}
        </p>
        {daysSinceJoined !== null && (
          <p style={{ fontSize: 12, color: 'var(--text-hint)', marginTop: 4 }}>
            已陪伴我们 {daysSinceJoined} 天
          </p>
        )}
      </div>

      {/* Edit Form */}
      <div style={{
        background: 'var(--bg-white)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow)',
        padding: '20px',
      }}>
        <div className="form-group">
          <label>用户名</label>
          <input
            type="text"
            value={form.username}
            readOnly
            style={{
              background: 'var(--bg)',
              color: 'var(--text-hint)',
              cursor: 'not-allowed',
            }}
          />
          <p style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 4 }}>用户名不可修改</p>
        </div>

        <div className="form-group">
          <label>手机号</label>
          <input
            type="tel"
            value={form.phone}
            onChange={handleChange('phone')}
            placeholder="请输入手机号"
            maxLength={11}
          />
        </div>

        <div className="form-group">
          <label>邮箱</label>
          <input
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            placeholder="请输入邮箱地址"
          />
        </div>

        <button
          className="btn btn-primary btn-block"
          style={{ marginTop: 8, height: 44 }}
          onClick={handleSave}
          disabled={saving || !hasChanges}
        >
          {saving ? '保存中...' : '保存修改'}
        </button>
      </div>

      {/* Additional Info */}
      <div style={{
        marginTop: 16,
        background: 'var(--bg-white)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow)',
        padding: '16px 20px',
      }}>
        <div style={{ fontSize: 13, color: 'var(--text-hint)', marginBottom: 8 }}>
          账号信息
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
          <span style={{ color: 'var(--text-secondary)' }}>积分</span>
          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{user.points ?? 0}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
          <span style={{ color: 'var(--text-secondary)' }}>宠物数量</span>
          <span>{user.pet_count ?? 0}</span>
        </div>
      </div>
    </div>
  )
}
