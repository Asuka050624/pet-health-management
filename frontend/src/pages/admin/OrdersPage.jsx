import { useState, useEffect } from 'react'
import { getAdminOrders, updateOrderStatus } from '../../api/admin'
import { formatPrice, formatDateTime } from '../../utils/formatters'
import StatusBadge from '../../components/admin/StatusBadge'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  const fetchOrders = () => {
    setLoading(true)
    getAdminOrders(statusFilter ? { status: statusFilter } : {})
      .then(({ data }) => setOrders(data.data || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [statusFilter])

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      fetchOrders()
    } catch (err) {
      alert(err.response?.data?.error || '操作失败')
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 20 }}>订单管理</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'].map((s) => (
          <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: 12 }}
            onClick={() => setStatusFilter(s)}>
            {s === '' ? '全部' : { pending: '待付款', paid: '已付款', shipped: '已发货', delivered: '已签收', cancelled: '已取消' }[s]}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? <div className="spinner" /> : orders.length === 0 ? (
          <div className="empty-state"><div className="icon">📋</div><p>暂无订单</p></div>
        ) : (
          orders.map((order) => (
            <div key={order.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{order.id}</span>
                  <StatusBadge status={order.status} />
                </div>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#F44336' }}>{formatPrice(order.total_amount)}</span>
              </div>
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
                {order.items?.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span>{item.product_name} x{item.quantity}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
                <span style={{ fontSize: 12, color: 'var(--text-hint)' }}>{formatDateTime(order.created_at)}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {order.status === 'pending' && (
                    <>
                      <button className="btn btn-sm btn-primary" style={{ background: '#2196F3' }} onClick={() => handleStatusChange(order.id, 'paid')}>标记已付款</button>
                      <button className="btn btn-sm" style={{ background: '#F44336', color: '#fff' }} onClick={() => handleStatusChange(order.id, 'cancelled')}>取消</button>
                    </>
                  )}
                  {order.status === 'paid' && (
                    <button className="btn btn-sm btn-primary" style={{ background: '#9C27B0' }} onClick={() => handleStatusChange(order.id, 'shipped')}>标记已发货</button>
                  )}
                  {order.status === 'shipped' && (
                    <button className="btn btn-sm btn-primary" style={{ background: '#4CAF50' }} onClick={() => handleStatusChange(order.id, 'delivered')}>标记已签收</button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
