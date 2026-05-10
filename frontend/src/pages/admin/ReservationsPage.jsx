import { useState, useEffect } from 'react'
import { getAdminReservations, updateReservationStatus } from '../../api/admin'
import { formatDate } from '../../utils/formatters'
import StatusBadge from '../../components/admin/StatusBadge'

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  const fetchData = () => {
    setLoading(true)
    getAdminReservations(statusFilter ? { status: statusFilter } : {})
      .then(({ data }) => setReservations(data.data || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [statusFilter])

  const handleStatus = async (id, status) => {
    try {
      await updateReservationStatus(id, status)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.error || '操作失败')
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 20 }}>预约管理</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['', 'pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
          <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: 12 }} onClick={() => setStatusFilter(s)}>
            {s === '' ? '全部' : { pending: '待确认', confirmed: '已确认', completed: '已完成', cancelled: '已取消' }[s]}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? <div className="spinner" /> : reservations.length === 0 ? (
          <div className="empty-state"><div className="icon">📅</div><p>暂无预约</p></div>
        ) : (
          reservations.map((r) => (
            <div key={r.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 600 }}>{r.pet_name} - {r.doctor_name}</span>
                <StatusBadge status={r.status} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13, marginBottom: 12 }}>
                <div><span style={{ color: 'var(--text-hint)' }}>预约日期：</span>{formatDate(r.appointment_date)}</div>
                <div><span style={{ color: 'var(--text-hint)' }}>预约时间：</span>{r.appointment_time}</div>
                <div><span style={{ color: 'var(--text-hint)' }}>联系人：</span>{r.contact_name}</div>
                <div><span style={{ color: 'var(--text-hint)' }}>联系电话：</span>{r.contact_phone}</div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                <span style={{ color: 'var(--text-hint)' }}>症状描述：</span>{r.symptoms}
              </div>
              {(r.status === 'pending' || r.status === 'confirmed') && (
                <div style={{ display: 'flex', gap: 6 }}>
                  {r.status === 'pending' && (
                    <button className="btn btn-sm btn-primary" onClick={() => handleStatus(r.id, 'confirmed')}>确认预约</button>
                  )}
                  <button className="btn btn-sm btn-primary" style={{ background: '#4CAF50' }} onClick={() => handleStatus(r.id, 'completed')}>标记完成</button>
                  <button className="btn btn-sm" style={{ background: '#F44336', color: '#fff' }} onClick={() => handleStatus(r.id, 'cancelled')}>取消</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
