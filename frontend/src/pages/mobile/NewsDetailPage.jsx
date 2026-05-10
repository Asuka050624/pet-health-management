import { useState, useEffect, useContext, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { getNewsDetail, getNewsComments, addNewsComment } from '../../api/news'
import { formatDateTime, formatDate } from '../../utils/formatters'

const CATEGORY_COLORS = {
  '疾病预防': { bg: '#FCE4EC', color: '#C62828' },
  '训练技巧': { bg: '#E3F2FD', color: '#0D47A1' },
  '营养饮食': { bg: '#E8F5E9', color: '#1B5E20' },
  '行业动态': { bg: '#FFF3E0', color: '#E65100' },
}

export default function NewsDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useContext(AuthContext)

  // News detail state
  const [news, setNews] = useState(null)
  const [detailLoading, setDetailLoading] = useState(true)
  const [detailError, setDetailError] = useState('')

  // Comments state
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentsError, setCommentsError] = useState('')
  const [commentPage, setCommentPage] = useState(1)
  const [commentTotal, setCommentTotal] = useState(0)
  const commentPageSize = 10

  // Comment form state
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [commentFormError, setCommentFormError] = useState('')
  const [toast, setToast] = useState(null)

  // ----- Fetch news detail -----
  const fetchDetail = useCallback(async () => {
    if (!id) return
    setDetailLoading(true)
    setDetailError('')
    try {
      const { data } = await getNewsDetail(id)
      const detail = data.data || data
      setNews(detail)
    } catch (err) {
      if (err.response?.status === 404) {
        setDetailError('资讯不存在或已被删除')
      } else {
        setDetailError(err.response?.data?.message || '加载资讯详情失败')
      }
      setNews(null)
    } finally {
      setDetailLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  // ----- Fetch comments -----
  const fetchComments = useCallback(async (p = 1) => {
    if (!id) return
    setCommentsLoading(true)
    setCommentsError('')
    try {
      const { data } = await getNewsComments(id, { page: p, pageSize: commentPageSize })
      const list = data.data?.list || data.data || data.list || data || []
      const t = data.data?.total || data.total || list.length
      setComments(list)
      setCommentTotal(t)
      setCommentPage(p)
    } catch (err) {
      setCommentsError(err.response?.data?.message || '加载评论失败')
      setComments([])
    } finally {
      setCommentsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchComments(1)
  }, [fetchComments])

  // ----- Submit comment -----
  const handleSubmitComment = async (e) => {
    e.preventDefault()
    const trimmed = newComment.trim()
    if (!trimmed) {
      setCommentFormError('请输入评论内容')
      return
    }
    if (trimmed.length < 2) {
      setCommentFormError('评论内容至少需要2个字符')
      return
    }
    if (!isAuthenticated) {
      showToast('请先登录后再评论', 'info')
      return
    }
    setSubmittingComment(true)
    setCommentFormError('')
    try {
      await addNewsComment(id, trimmed)
      setNewComment('')
      showToast('评论发表成功', 'success')
      fetchComments(commentPage)
    } catch (err) {
      showToast(err.response?.data?.message || '评论发表失败', 'error')
    } finally {
      setSubmittingComment(false)
    }
  }

  // ----- Toast -----
  const showToast = (message, type) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }

  // ----- Pagination -----
  const totalCommentPages = Math.max(1, Math.ceil(commentTotal / commentPageSize))

  // ====== Render ======
  return (
    <div style={{ paddingBottom: 'var(--bottom-nav-height)', padding: '16px', maxWidth: 'var(--mobile-max-width)', margin: '0 auto' }}>
      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          fontSize: 14,
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          padding: '8px 0',
          marginBottom: 12,
        }}
      >
        <span style={{ fontSize: 16 }}>←</span> 返回
      </button>

      {/* Loading */}
      {detailLoading && (
        <div className="spinner" />
      )}

      {/* Error */}
      {!detailLoading && detailError && (
        <div className="card empty-state">
          <div style={{ fontSize: 40, marginBottom: 8 }}>📰</div>
          <p style={{ color: 'var(--danger)' }}>{detailError}</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
            <button className="btn btn-primary btn-sm" onClick={fetchDetail}>
              重试
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}>
              返回列表
            </button>
          </div>
        </div>
      )}

      {/* News content */}
      {!detailLoading && news && (
        <>
          {/* Cover */}
          <img
            src={news.cover_image || `/images/news${id}.jpg`}
            alt={news.title}
            style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: 16 }}
            onError={(e) => { e.target.src = '/images/news1.jpg' }}
          />

          {/* Meta info */}
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            {/* Category badge */}
            {news.category && (() => {
              const catColors = CATEGORY_COLORS[news.category] || { bg: '#F5F5F5', color: '#757575' }
              return (
                <span style={{
                  display: 'inline-block',
                  padding: '3px 10px',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 500,
                  background: catColors.bg,
                  color: catColors.color,
                  marginBottom: 10,
                }}>
                  {news.category}
                </span>
              )
            })()}

            {/* Title */}
            <h1 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.5, marginBottom: 12 }}>
              {news.title}
            </h1>

            {/* Author & date & stats */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                {news.author && (
                  <span>✍️ {news.author}</span>
                )}
                <span>📅 {formatDate(news.publish_date || news.createdAt)}</span>
              </div>
              <div style={{ display: 'flex', gap: 14, fontSize: 13, color: 'var(--text-hint)' }}>
                <span>👁 {news.view_count ?? news.views ?? 0} 阅读</span>
                <span>💬 {news.comment_count ?? news.comments ?? commentTotal} 评论</span>
              </div>
            </div>
          </div>

          {/* Article body */}
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            {news.content ? (
              <div
                className="news-content"
                dangerouslySetInnerHTML={{ __html: news.content }}
                style={{
                  fontSize: 15,
                  lineHeight: 1.9,
                  color: 'var(--text-primary)',
                  wordBreak: 'break-word',
                }}
              />
            ) : (
              <p style={{ color: 'var(--text-hint)', textAlign: 'center', padding: '20px 0' }}>
                暂无正文内容
              </p>
            )}
          </div>

          {/* ====== Comments section ====== */}
          <div style={{ marginTop: 8 }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 14 }}>
              评论 ({commentTotal})
            </h2>

            {/* Comment form */}
            <div className="card" style={{ padding: 16, marginBottom: 16 }}>
              {isAuthenticated ? (
                <form onSubmit={handleSubmitComment}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: commentFormError ? 8 : 10 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}>
                      {(user?.username || user?.name || '?')[0]}
                    </div>
                    <textarea
                      rows={3}
                      placeholder="写下你的评论..."
                      value={newComment}
                      onChange={(e) => {
                        setNewComment(e.target.value)
                        if (commentFormError) setCommentFormError('')
                      }}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        border: `1px solid ${commentFormError ? 'var(--danger)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius)',
                        fontSize: 14,
                        outline: 'none',
                        resize: 'none',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>
                  {commentFormError && (
                    <p style={{ color: 'var(--danger)', fontSize: 12, marginBottom: 8, paddingLeft: 46 }}>
                      {commentFormError}
                    </p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={submittingComment || !newComment.trim()}
                    >
                      {submittingComment ? '发表中...' : '发表评论'}
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <p style={{ fontSize: 14, color: 'var(--text-hint)', marginBottom: 8 }}>
                    登录后即可发表评论
                  </p>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate('/auth/login')}
                  >
                    去登录
                  </button>
                </div>
              )}
            </div>

            {/* Comments list */}
            {commentsLoading ? (
              <div className="spinner" />
            ) : commentsError ? (
              <div className="card" style={{ textAlign: 'center', padding: 20 }}>
                <p style={{ color: 'var(--danger)', fontSize: 14 }}>{commentsError}</p>
                <button className="btn btn-outline btn-sm" style={{ marginTop: 8 }} onClick={() => fetchComments(1)}>
                  重试
                </button>
              </div>
            ) : comments.length === 0 ? (
              <div className="card empty-state" style={{ padding: '30px 20px' }}>
                <div className="icon">💬</div>
                <p>暂无评论，快来发表第一条评论吧</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {comments.map((c) => (
                  <div key={c.id || c._id} className="card" style={{ padding: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      {/* Avatar */}
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}>
                        {(c.username || c.user_name || '?')[0]}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                            {c.username || c.user_name || '匿名用户'}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--text-hint)' }}>
                            {formatDateTime(c.createdAt || c.create_time)}
                          </span>
                        </div>
                        <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7, wordBreak: 'break-word' }}>
                          {c.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Comment pagination */}
                {totalCommentPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 8 }}>
                    <button
                      className="btn btn-outline btn-sm"
                      disabled={commentPage <= 1}
                      onClick={() => fetchComments(commentPage - 1)}
                    >
                      上一页
                    </button>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {commentPage} / {totalCommentPages}
                    </span>
                    <button
                      className="btn btn-outline btn-sm"
                      disabled={commentPage >= totalCommentPages}
                      onClick={() => fetchComments(commentPage + 1)}
                    >
                      下一页
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
