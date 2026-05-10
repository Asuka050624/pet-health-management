import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getNewsList } from '../../api/news'
import { formatDate } from '../../utils/formatters'

function getNewsImage(newsId) {
  return `/images/news${newsId}.jpg`
}

const CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: '疾病预防', label: '疾病预防' },
  { key: '训练技巧', label: '训练技巧' },
  { key: '营养饮食', label: '营养饮食' },
  { key: '行业动态', label: '行业动态' },
]

const CATEGORY_COLORS = {
  '疾病预防': { bg: '#FCE4EC', color: '#C62828' },
  '训练技巧': { bg: '#E3F2FD', color: '#0D47A1' },
  '营养饮食': { bg: '#E8F5E9', color: '#1B5E20' },
  '行业动态': { bg: '#FFF3E0', color: '#E65100' },
}

export default function NewsPage() {
  const navigate = useNavigate()

  const [activeCategory, setActiveCategory] = useState('all')
  const [newsList, setNewsList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  const fetchNews = useCallback(async (category, p = 1) => {
    setLoading(true)
    setError('')
    try {
      const params = { page: p, pageSize }
      if (category && category !== 'all') {
        params.category = category
      }
      const { data } = await getNewsList(params)
      const list = data.data?.list || data.data || data.list || data || []
      const t = data.data?.total || data.total || list.length
      setNewsList(list)
      setTotal(t)
      setPage(p)
    } catch (err) {
      setError(err.response?.data?.message || '加载资讯列表失败')
      setNewsList([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNews(activeCategory, 1)
  }, [activeCategory, fetchNews])

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat)
  }

  const handleCardClick = (news) => {
    const id = news.id || news._id
    navigate(`/mobile/news/${id}`)
  }

  const truncate = (text, maxLen = 80) => {
    if (!text) return ''
    return text.length > maxLen ? text.slice(0, maxLen) + '...' : text
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div style={{ paddingBottom: 'var(--bottom-nav-height)', padding: '16px', maxWidth: 'var(--mobile-max-width)', margin: '0 auto' }}>
      {/* Header */}
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>宠物资讯</h1>

      {/* Category filter tabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 16,
        overflowX: 'auto',
        paddingBottom: 4,
        WebkitOverflowScrolling: 'touch',
      }}>
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.key
          return (
            <button
              key={cat.key}
              onClick={() => handleCategoryChange(cat.key)}
              style={{
                flexShrink: 0,
                padding: '8px 16px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#fff' : 'var(--text-secondary)',
                background: isActive ? 'var(--primary)' : 'var(--bg-white)',
                border: isActive ? 'none' : '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="spinner" />
      ) : error ? (
        <div className="card empty-state">
          <div style={{ fontSize: 40, marginBottom: 8 }}>⚠️</div>
          <p style={{ color: 'var(--danger)' }}>{error}</p>
          <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => fetchNews(activeCategory, 1)}>
            重试
          </button>
        </div>
      ) : newsList.length === 0 ? (
        <div className="card empty-state">
          <div className="icon">📰</div>
          <p>暂无相关资讯</p>
          {activeCategory !== 'all' && (
            <button
              className="btn btn-outline btn-sm"
              style={{ marginTop: 12 }}
              onClick={() => setActiveCategory('all')}
            >
              查看全部
            </button>
          )}
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {newsList.map((item) => {
              const cat = item.category || '其他'
              const catColors = CATEGORY_COLORS[cat] || { bg: '#F5F5F5', color: '#757575' }
              const id = item.id || item._id
              return (
                <div
                  key={id}
                  className="card"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleCardClick(item)}
                >
                  {/* Cover image */}
                  <img
                    src={item.cover_image || getNewsImage(item.id)}
                    alt={item.title}
                    style={{ width: '100%', height: 160, objectFit: 'cover' }}
                    onError={(e) => { e.target.src = '/images/news1.jpg' }}
                  />

                  {/* Content */}
                  <div style={{ padding: 14 }}>
                    {/* Category badge */}
                    <div style={{ marginBottom: 8 }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 500,
                        background: catColors.bg,
                        color: catColors.color,
                      }}>
                        {cat}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 style={{
                      fontSize: 15,
                      fontWeight: 600,
                      marginBottom: 6,
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {item.title}
                    </h3>

                    {/* Summary */}
                    {item.summary && (
                      <p style={{
                        fontSize: 13,
                        color: 'var(--text-secondary)',
                        lineHeight: 1.6,
                        marginBottom: 10,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {truncate(item.summary, 100)}
                      </p>
                    )}

                    {/* Footer: stats + date */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-hint)' }}>
                        <span>👁 {item.view_count ?? item.views ?? 0}</span>
                        <span>💬 {item.comment_count ?? item.comments ?? 0}</span>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-hint)' }}>
                        {formatDate(item.publish_date || item.createdAt)}
                      </span>
                    </div>
                  </div>
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
                onClick={() => fetchNews(activeCategory, page - 1)}
              >
                上一页
              </button>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {page} / {totalPages}
              </span>
              <button
                className="btn btn-outline btn-sm"
                disabled={page >= totalPages}
                onClick={() => fetchNews(activeCategory, page + 1)}
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
