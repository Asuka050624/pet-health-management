import { useState, useEffect, useCallback } from 'react'
import { getOrders, cancelOrder } from '../../api/orders'
import { ORDER_STATUS } from '../../utils/constants'
import { formatPrice, formatDateTime } from '../../utils/formatters'
import { useToast } from '../../components/common/Toast'

const STATUS_COLORS = {
  pending: '#FF9800',
  paid: '#2196F3',
  shipped: '#9C27B0',
  delivered: '#4CAF50',
  cancelled: '#9E9E9E',
}

const PAGE_SIZE = 10

function CancelConfirmModal({ visible, orderId, onConfirm, onClose }) {
  const [cancelling, setCancelling] = useState(false)

  if (!visible) return null

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await onConfirm(orderId)
      onClose()
    } catch {
      // error handled by parent
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ width: '85%', maxWidth: 360, padding: 24, textAlign: 'center' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>❓</div>
        <h3 style={{ fontSize: 17, marginBottom: 8 }}>确认取消订单</h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
          确定要取消该订单吗？取消后无法恢复。
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>
            暂不取消
          </button>
          <button
            className="btn btn-danger"
            style={{ flex: 1 }}
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? '取消中...' : '确认取消'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [cancelTarget, setCancelTarget] = useState(null)
  const showToast = useToast()

  const fetchOrders = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }
    setError('')
    try {
      const { data } = await getOrders({ page: pageNum, per_page: PAGE_SIZE })
      const list = data.data || []
      if (append) {
        setOrders((prev) => [...prev, ...list])
      } else {
        setOrders(list)
      }
      setHasMore(list.length >= PAGE_SIZE)
      setPage(pageNum)
    } catch (err) {
      setError(err.response?.data?.error || '加载订单失败')
      if (!append) setOrders([])
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders(1)
  }, [fetchOrders])

  const handleCancelOrder = async (orderId) => {
    await cancelOrder(orderId)
    showToast('订单已取消')
    setCancelTarget(null)
    // Update order status locally
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o))
    )
  }

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchOrders(page + 1, true)
    }
  }

  const getStatusBadge = (status) => {
    const color = STATUS_COLORS[status] || '#757575'
    const label = ORDER_STATUS[status] || status
    return (
      <span style={{
        display: 'inline-block',
        padding: '3px 8px',
        borderRadius: 10,
        fontSize: 11,
        fontWeight: 500,
        background: `${color}18`,
        color: color,
      }}>
        {label}
      </span>
    )
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div className="spinner" />
        <p style={{ marginTop: 16, color: 'var(--text-secondary)', fontSize: 14 }}>加载中...</p>
      </div>
    )
  }

  if (error && orders.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>{error}</p>
        <button className="btn btn-outline btn-sm" onClick={() => fetchOrders(1)}>重试</button>
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
        <h2 style={{ fontSize: 18 }}>我的订单</h2>
        <span style={{ fontSize: 12, color: 'var(--text-hint)' }}>
          共 {orders.length} 条
        </span>
      </div>

      {/* Order List */}
      {orders.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 64, marginBottom: 12 }}>🛒</div>
          <p>暂无订单</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>去商城逛逛下单吧</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                background: 'var(--bg-white)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow)',
                padding: 16,
              }}
            >
              {/* Order Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
              }}>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  订单号：{order.order_no || order.id}
                </div>
                {getStatusBadge(order.status)}
              </div>

              {/* Order Items Preview */}
              {order.items && order.items.length > 0 && (
                <div style={{
                  display: 'flex',
                  gap: 8,
                  marginBottom: 12,
                  padding: '10px 0',
                  borderTop: '1px solid var(--border)',
                  borderBottom: '1px solid var(--border)',
                }}>
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} style={{
                      width: 52,
                      height: 52,
                      borderRadius: 8,
                      background: '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: 24 }}>🛍️</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div style={{
                      width: 52,
                      height: 52,
                      borderRadius: 8,
                      background: 'var(--bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      color: 'var(--text-hint)',
                      flexShrink: 0,
                    }}>
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>
              )}

              {/* Order Footer */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text-hint)' }}>
                    {formatDateTime(order.created_at)}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#F44336', marginTop: 2 }}>
                    {formatPrice(order.total_amount || order.total_price || 0)}
                  </div>
                </div>

                {/* Cancel Button for pending orders */}
                {order.status === 'pending' && (
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ color: '#F44336', borderColor: '#F44336' }}
                    onClick={() => setCancelTarget(order.id)}
                  >
                    取消订单
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Load More */}
          {hasMore && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              {loadingMore ? (
                <span style={{ fontSize: 13, color: 'var(--text-hint)' }}>加载中...</span>
              ) : (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={handleLoadMore}
                  style={{ width: '100%' }}
                >
                  加载更多
                </button>
              )}
            </div>
          )}

          {!hasMore && orders.length > 0 && (
            <div style={{
              textAlign: 'center',
              padding: '16px 0',
              fontSize: 12,
              color: 'var(--text-hint)',
            }}>
              已展示全部订单
            </div>
          )}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <CancelConfirmModal
        visible={!!cancelTarget}
        orderId={cancelTarget}
        onConfirm={handleCancelOrder}
        onClose={() => setCancelTarget(null)}
      />
    </div>
  )
}
