import { useState, useEffect, useContext, useCallback } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { getFeedbacks, createFeedback } from '../../api/feedbacks'
import { formatDateTime } from '../../utils/formatters'

const FEEDBACK_TYPES = [
  { value: 'suggestion', label: '建议' },
  { value: 'bug', label: '问题反馈' },
  { value: 'compliment', label: '好评' },
  { value: 'other', label: '其他' },
]

const TYPE_COLORS = {
  suggestion: { bg: '#E3F2FD', color: '#0D47A1', border: '#64B5F6' },
  bug: { bg: '#FFF3E0', color: '#E65100', border: '#FFB74D' },
  compliment: { bg: '#E8F5E9', color: '#1B5E20', border: '#81C784' },
  other: { bg: '#F5F5F5', color: '#757575', border: '#BDBDBD' },
}

const STATUS_COLORS = {
  pending: { bg: '#FFF3E0', color: '#E65100', border: '#FFB74D' },
  processing: { bg: '#E3F2FD', color: '#0D47A1', border: '#64B5F6' },
  replied: { bg: '#E8F5E9', color: '#1B5E20', border: '#81C784' },
  closed: { bg: '#F5F5F5', color: '#757575', border: '#BDBDBD' },
}

const STATUS_LABELS = {
  pending: '待处理',
  processing: '处理中',
  replied: '已回复',
  closed: '已关闭',
}

export default function FeedbackPage() {
  const { user } = useContext(AuthContext)
  const [activeTab, setActiveTab] = useState('list') // 'list' | 'create'

  // List state
  const [feedbacks, setFeedbacks] = useState([])
  const [listLoading, setListLoading] = useState(false)
  const [listError, setListError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  // Form state
  const [form, setForm] = useState({
    type: 'suggestion',
    content: '',
    contact: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  // ----- List -----
  const fetchFeedbacks = useCallback(async (p = 1) => {
    setListLoading(true)
    setListError('')
    try {
      const { data } = await getFeedbacks({ page: p, pageSize })
      const list = data.data?.list || data.data || data.list || data || []
      const t = data.data?.total || data.total || list.length
      setFeedbacks(list)
      setTotal(t)
      setPage(p)
    } catch (err) {
      setListError(err.response?.data?.message || '加载反馈列表失败')
      setFeedbacks([])
    } finally {
      setListLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFeedbacks(1)
  }, [fetchFeedbacks])

  // ----- Form -----
  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!form.content.trim()) errors.content = '请输入反馈内容'
    if (form.content.trim().length < 4) errors.content = '反馈内容至少需要4个字符'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setSubmitting(true)
    try {
      await createFeedback(form)
      showToast('反馈提交成功，感谢您的反馈！', 'success')
      setForm({ type: 'suggestion', content: '', contact: '' })
      setFormErrors({})
      setActiveTab('list')
      fetchFeedbacks(1)
    } catch (err) {
      showToast(err.response?.data?.message || '提交失败，请稍后再试', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // ----- Toast -----
  const showToast = (message, type) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }

  // ----- Helpers -----
  const getTypeLabel = (type) => {
    const found = FEEDBACK_TYPES.find((t) => t.value === type)
    return found ? found.label : type || '其他'
  }

  const truncate = (text, maxLen = 120) => {
    if (!text) return ''
    return text.length > maxLen ? text.slice(0, maxLen) + '...' : text
  }

  // ----- Pagination -----
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  // ----- Render -----
  return (
    <div style={{ paddingBottom: 'var(--bottom-nav-height)', padding: '16px', maxWidth: 'var(--mobile-max-width)', margin: '0 auto' }}>
      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      {/* Header */}
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>反馈中心</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', marginBottom: 16, background: 'var(--bg-white)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
        {[
          { key: 'list', label: '我的反馈' },
          { key: 'create', label: '提交反馈' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              padding: '12px 0',
              textAlign: 'center',
              fontSize: 14,
              fontWeight: activeTab === tab.key ? 600 : 400,
              color: activeTab === tab.key ? '#fff' : 'var(--text-secondary)',
              background: activeTab === tab.key ? 'var(--primary)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ======== My Feedbacks Tab ======== */}
      {activeTab === 'list' && (
        <>
          {listLoading ? (
            <div className="spinner" />
          ) : listError ? (
            <div className="card empty-state">
              <div style={{ fontSize: 40, marginBottom: 8 }}>⚠️</div>
              <p style={{ color: 'var(--danger)' }}>{listError}</p>
              <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => fetchFeedbacks(1)}>
                重试
              </button>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="card empty-state">
              <div className="icon">💬</div>
              <p>暂无反馈记录</p>
              <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setActiveTab('create')}>
                立即反馈
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {feedbacks.map((fb) => {
                  const fbType = fb.type || 'other'
                  const fbStatus = fb.status || 'pending'
                  const typeColors = TYPE_COLORS[fbType] || TYPE_COLORS.other
                  const statusColors = STATUS_COLORS[fbStatus] || STATUS_COLORS.pending

                  return (
                    <div
                      key={fb.id || fb._id}
                      className="card"
                      style={{ padding: 16 }}
                    >
                      {/* Header: type badge + status badge + time */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 500,
                            background: typeColors.bg,
                            color: typeColors.color,
                            border: `1px solid ${typeColors.border}`,
                          }}>
                            {getTypeLabel(fbType)}
                          </span>
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 500,
                            background: statusColors.bg,
                            color: statusColors.color,
                            border: `1px solid ${statusColors.border}`,
                          }}>
                            {STATUS_LABELS[fbStatus] || fbStatus}
                          </span>
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-hint)' }}>
                          {formatDateTime(fb.createdAt || fb.create_time)}
                        </span>
                      </div>

                      {/* Content preview */}
                      <p style={{
                        fontSize: 14,
                        color: 'var(--text-primary)',
                        lineHeight: 1.7,
                        marginBottom: fbStatus === 'replied' && fb.reply ? 0 : 8,
                      }}>
                        {truncate(fb.content)}
                      </p>

                      {/* Contact */}
                      {fb.contact && (
                        <p style={{ fontSize: 12, color: 'var(--text-hint)', marginBottom: 8 }}>
                          联系方式：{fb.contact}
                        </p>
                      )}

                      {/* Admin reply */}
                      {fbStatus === 'replied' && (fb.reply || fb.admin_reply) && (
                        <div style={{
                          marginTop: 10,
                          padding: '10px 12px',
                          background: '#F1F8E9',
                          borderLeft: '3px solid var(--primary)',
                          borderRadius: '0 var(--radius) var(--radius) 0',
                        }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', marginBottom: 4 }}>
                            管理员回复
                          </div>
                          <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                            {fb.reply || fb.admin_reply}
                          </p>
                          {(fb.reply_at || fb.replied_at) && (
                            <p style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 4 }}>
                              {formatDateTime(fb.reply_at || fb.replied_at)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16 }}>
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={page <= 1}
                    onClick={() => fetchFeedbacks(page - 1)}
                  >
                    上一页
                  </button>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {page} / {totalPages}
                  </span>
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={page >= totalPages}
                    onClick={() => fetchFeedbacks(page + 1)}
                  >
                    下一页
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ======== Submit Feedback Tab ======== */}
      {activeTab === 'create' && (
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>提交反馈</h2>
          <form onSubmit={handleSubmit}>
            {/* 反馈类型 */}
            <div className="form-group">
              <label>反馈类型</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {FEEDBACK_TYPES.map((t) => {
                  const isActive = form.type === t.value
                  const colors = TYPE_COLORS[t.value] || TYPE_COLORS.other
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => handleFormChange('type', t.value)}
                      style={{
                        padding: '10px 0',
                        borderRadius: 'var(--radius)',
                        fontSize: 14,
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? colors.color : 'var(--text-secondary)',
                        background: isActive ? colors.bg : 'var(--bg)',
                        border: `1px solid ${isActive ? colors.border : 'var(--border)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {t.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 反馈内容 */}
            <div className="form-group">
              <label>反馈内容 *</label>
              <textarea
                rows={5}
                placeholder="请详细描述您的建议或遇到的问题..."
                value={form.content}
                onChange={(e) => handleFormChange('content', e.target.value)}
                style={formErrors.content ? { borderColor: 'var(--danger)' } : {}}
              />
              {formErrors.content && (
                <span style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4, display: 'block' }}>
                  {formErrors.content}
                </span>
              )}
              <div style={{ fontSize: 12, color: 'var(--text-hint)', marginTop: 4, textAlign: 'right' }}>
                {form.content.length} 字
              </div>
            </div>

            {/* 联系方式（选填） */}
            <div className="form-group">
              <label>联系方式（选填）</label>
              <input
                type="text"
                placeholder="手机号或邮箱，方便我们联系您"
                value={form.contact}
                onChange={(e) => handleFormChange('contact', e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={submitting}
              style={{ marginTop: 8, padding: '12px 0', fontSize: 16 }}
            >
              {submitting ? '提交中...' : '提交反馈'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
