import { useState, useEffect } from 'react'
import { getAdminFeedbacks, replyFeedback } from '../../api/admin'
import { formatDateTime } from '../../utils/formatters'
import StatusBadge from '../../components/admin/StatusBadge'

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState('')
  const [replyingId, setReplyingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const fetchData = () => {
    setLoading(true)
    getAdminFeedbacks().then(({ data }) => setFeedbacks(data.data || [])).finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleReply = async (fbId) => {
    if (!replyText.trim()) return alert('请输入回复内容')
    setSaving(true)
    try {
      await replyFeedback(fbId, replyText)
      setReplyText('')
      setReplyingId(null)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.error || '回复失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 20 }}>反馈管理</h2>
      <div className="card">
        {loading ? <div className="spinner" /> : feedbacks.length === 0 ? (
          <div className="empty-state"><div className="icon">💬</div><p>暂无反馈</p></div>
        ) : (
          feedbacks.map((fb) => (
            <div key={fb.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>{fb.username}</span>
                  <StatusBadge status={fb.type} />
                  <StatusBadge status={fb.status} />
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-hint)' }}>{formatDateTime(fb.created_at)}</span>
              </div>
              <p style={{ fontSize: 14, marginBottom: 8 }}>{fb.content}</p>
              {fb.contact && <p style={{ fontSize: 12, color: 'var(--text-hint)' }}>联系方式：{fb.contact}</p>}
              {fb.reply && (
                <div style={{ background: '#E8F5E9', borderRadius: 6, padding: 10, marginTop: 8, fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>回复（{fb.replier_name || '管理员'}）：</span>{fb.reply}
                </div>
              )}
              {fb.status !== 'replied' && fb.status !== 'closed' && (
                <div style={{ marginTop: 12 }}>
                  {replyingId === fb.id ? (
                    <div>
                      <textarea rows={2} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border)' }}
                        value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="输入回复内容..." />
                      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                        <button className="btn btn-primary btn-sm" disabled={saving} onClick={() => handleReply(fb.id)}>{saving ? '发送中...' : '发送回复'}</button>
                        <button className="btn btn-outline btn-sm" onClick={() => { setReplyingId(null); setReplyText('') }}>取消</button>
                      </div>
                    </div>
                  ) : (
                    <button className="btn btn-outline btn-sm" onClick={() => setReplyingId(fb.id)}>回复</button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
