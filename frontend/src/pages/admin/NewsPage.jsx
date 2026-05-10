import { useState, useEffect } from 'react'
import { getAdminNews, createNews, updateNews, deleteNews } from '../../api/admin'
import { formatDateTime } from '../../utils/formatters'
import StatusBadge from '../../components/admin/StatusBadge'

export default function NewsPage() {
  const [newsList, setNewsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', category: '疾病预防', summary: '', content: '', author: '', cover_image: '', is_published: false })
  const [saving, setSaving] = useState(false)

  const fetchData = () => {
    setLoading(true)
    getAdminNews().then(({ data }) => setNewsList(data.data || [])).finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ title: '', category: '疾病预防', summary: '', content: '', author: '', cover_image: '', is_published: false })
    setShowForm(true)
  }

  const openEdit = (news) => {
    setEditing(news)
    setForm({
      title: news.title, category: news.category, summary: news.summary || '',
      content: news.content || '', author: news.author || '', cover_image: news.cover_image || '',
      is_published: news.is_published,
    })
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title || !form.content) return alert('请填写标题和内容')
    setSaving(true)
    try {
      if (editing) {
        await updateNews(editing.id, form)
      } else {
        await createNews(form)
      }
      setShowForm(false)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.error || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (news) => {
    if (!window.confirm(`确定要删除资讯 "${news.title}" 吗？`)) return
    try {
      await deleteNews(news.id)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.error || '删除失败')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 22 }}>资讯管理</h2>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>发布资讯</button>
      </div>

      <div className="card">
        {loading ? <div className="spinner" /> : newsList.length === 0 ? (
          <div className="empty-state"><div className="icon">📰</div><p>暂无资讯</p></div>
        ) : (
          newsList.map((n) => (
            <div key={n.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600 }}>{n.title}</span>
                    <StatusBadge status={n.is_published ? 'active' : 'inactive'} mapping={{ active: { label: '已发布', bg: '#D4EDDA', color: '#155724' }, inactive: { label: '草稿', bg: '#FFF3CD', color: '#856404' } }} />
                    <span style={{ fontSize: 12, color: 'var(--text-hint)', padding: '1px 8px', background: '#f0f0f0', borderRadius: 4 }}>{n.category}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{n.summary || '(无摘要)'}</p>
                  <div style={{ fontSize: 12, color: 'var(--text-hint)', marginTop: 4 }}>
                    阅读: {n.view_count} | 评论: {n.comment_count} | {formatDateTime(n.created_at)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 16 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(n)}>编辑</button>
                  <button className="btn btn-sm" style={{ background: '#F44336', color: '#fff' }} onClick={() => handleDelete(n)}>删除</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" style={{ padding: 24, width: 700, maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 20 }}>{editing ? '编辑资讯' : '发布资讯'}</h3>
            <form onSubmit={handleSave}>
              <div className="form-group"><label>标题 *</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group"><label>分类</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="疾病预防">疾病预防</option><option value="训练技巧">训练技巧</option>
                    <option value="营养饮食">营养饮食</option><option value="行业动态">行业动态</option>
                  </select>
                </div>
                <div className="form-group"><label>作者</label><input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>摘要</label><input value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></div>
              <div className="form-group"><label>图片URL</label><input value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} /></div>
              <div className="form-group"><label>内容 (HTML) *</label>
                <textarea rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                  style={{ fontFamily: 'monospace', fontSize: 12 }} />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id="isPublished" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
                <label htmlFor="isPublished" style={{ margin: 0 }}>立即发布</label>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>取消</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '保存中...' : '保存'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
