import { useState, useEffect, useCallback } from 'react'
import { getMessages, markAsRead } from '../../api/messages'
import { formatDateTime } from '../../utils/formatters'
import { useToast } from '../../components/common/Toast'

export default function MessagesPage() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const showToast = useToast()

  const unreadCount = messages.filter((m) => !m.is_read && !m.read_at).length

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await getMessages()
      const responseData = data.data || data || {}
      setMessages(responseData.items || responseData || [])
    } catch (err) {
      setError(err.response?.data?.error || '加载消息失败')
      setMessages([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const handleMarkAsRead = async (message) => {
    // If already read, just toggle expansion
    if (message.is_read || message.read_at) {
      setExpandedId(expandedId === message.id ? null : message.id)
      return
    }

    try {
      await markAsRead(message.id)
      // Update local state
      setMessages((prev) =>
        prev.map((m) =>
          m.id === message.id
            ? { ...m, is_read: true, read_at: new Date().toISOString() }
            : m
        )
      )
      setExpandedId(message.id)
    } catch (err) {
      showToast(err.response?.data?.error || '标记已读失败', 'error')
    }
  }

  const getMessagePreview = (content) => {
    if (!content) return ''
    // Strip HTML tags if present
    const plain = String(content).replace(/<[^>]*>/g, '')
    return plain.length > 60 ? plain.slice(0, 60) + '...' : plain
  }

  const getMessageTypeIcon = (type) => {
    const icons = {
      system: '🔔',
      order: '📋',
      reservation: '📅',
      pet: '🐾',
      promotion: '🎁',
    }
    return icons[type] || '💬'
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div className="spinner" />
        <p style={{ marginTop: 16, color: 'var(--text-secondary)', fontSize: 14 }}>加载中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📨</div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>{error}</p>
        <button className="btn btn-outline btn-sm" onClick={fetchMessages}>重试</button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ fontSize: 18 }}>消息中心</h2>
          {unreadCount > 0 && (
            <span style={{
              background: '#F44336',
              color: '#fff',
              fontSize: 11,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 10,
              minWidth: 20,
              textAlign: 'center',
            }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-hint)' }}>
          共 {messages.length} 条
        </span>
      </div>

      {/* Message List */}
      {messages.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 64, marginBottom: 12 }}>📭</div>
          <p>暂无消息</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>当有新的通知时会显示在这里</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.map((message) => {
            const isRead = message.is_read || !!message.read_at
            const isExpanded = expandedId === message.id

            return (
              <div
                key={message.id}
                onClick={() => handleMarkAsRead(message)}
                style={{
                  background: isRead ? 'var(--bg-white)' : '#F1F8E9',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow)',
                  padding: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  borderLeft: isRead ? '3px solid transparent' : '3px solid var(--primary)',
                }}
              >
                {/* Message Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  marginBottom: isExpanded ? 10 : 0,
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: isRead ? 'var(--bg)' : '#E8F5E9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    flexShrink: 0,
                  }}>
                    {getMessageTypeIcon(message.type)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 4,
                    }}>
                      <span style={{
                        fontSize: 15,
                        fontWeight: isRead ? 400 : 600,
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '70%',
                      }}>
                        {message.title || '系统通知'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        {!isRead && (
                          <span style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: '#F44336',
                            flexShrink: 0,
                          }} />
                        )}
                        <span style={{ fontSize: 11, color: 'var(--text-hint)', whiteSpace: 'nowrap' }}>
                          {formatDateTime(message.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Content Preview (collapsed) */}
                    <p style={{
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: isExpanded ? 'normal' : 'nowrap',
                    }}>
                      {getMessagePreview(message.content)}
                    </p>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div style={{
                        marginTop: 10,
                        padding: '12px',
                        background: 'var(--bg)',
                        borderRadius: 'var(--radius)',
                        fontSize: 14,
                        color: 'var(--text-primary)',
                        lineHeight: 1.7,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}>
                        {message.content || '暂无内容'}
                      </div>
                    )}

                    {/* Expanded Meta */}
                    {isExpanded && message.read_at && (
                      <div style={{
                        marginTop: 8,
                        fontSize: 11,
                        color: 'var(--text-hint)',
                      }}>
                        已读于 {formatDateTime(message.read_at)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
