import { useState, useEffect, useContext, useCallback } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { getReservations, createReservation, cancelReservation } from '../../api/reservations'
import { PET_TYPES, PET_TYPE_NAMES, RESERVATION_STATUS } from '../../utils/constants'
import { formatDateTime } from '../../utils/formatters'

const DOCTOR_OPTIONS = [
  { value: 1, label: '张医生 - 宠物内科' },
  { value: 2, label: '李医生 - 宠物外科' },
  { value: 3, label: '王医生 - 宠物皮肤科' },
  { value: 4, label: '赵医生 - 宠物眼科' },
]

const STATUS_COLORS = {
  pending: { bg: '#FFF3E0', color: '#E65100', border: '#FFB74D' },
  confirmed: { bg: '#E3F2FD', color: '#0D47A1', border: '#64B5F6' },
  completed: { bg: '#E8F5E9', color: '#1B5E20', border: '#81C784' },
  cancelled: { bg: '#F5F5F5', color: '#757575', border: '#BDBDBD' },
}

const STATUS_ICONS = {
  pending: '⏳',
  confirmed: '✅',
  completed: '🏁',
  cancelled: '❌',
}

function getToday() {
  const d = new Date()
  return d.toISOString().split('T')[0]
}

export default function ReservationPage() {
  const { user } = useContext(AuthContext)
  const [activeTab, setActiveTab] = useState('list') // 'list' | 'create'

  // List state
  const [reservations, setReservations] = useState([])
  const [listLoading, setListLoading] = useState(false)
  const [listError, setListError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  // Form state
  const [form, setForm] = useState({
    pet_name: '',
    pet_type: 'dog',
    symptoms: '',
    doctor: 1,
    appointment_date: '',
    appointment_time: '',
    contact_name: '',
    contact_phone: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  // Pre-fill contact_name from user
  useEffect(() => {
    if (user?.username || user?.name) {
      setForm((prev) => ({ ...prev, contact_name: user.username || user.name }))
    }
  }, [user])

  // ----- List -----
  const fetchReservations = useCallback(async (p = 1) => {
    setListLoading(true)
    setListError('')
    try {
      const { data } = await getReservations({ page: p, per_page: pageSize })
      const list = data.data || []
      const t = data.data?.total || data.total || list.length
      setReservations(list)
      setTotal(t)
      setPage(p)
    } catch (err) {
      setListError(err.response?.data?.message || '加载预约列表失败')
      setReservations([])
    } finally {
      setListLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReservations(1)
  }, [fetchReservations])

  const handleCancel = async (id) => {
    if (!window.confirm('确定要取消该预约吗？')) return
    try {
      await cancelReservation(id)
      showToast('预约已取消', 'success')
      fetchReservations(page)
    } catch (err) {
      showToast(err.response?.data?.message || '取消失败', 'error')
    }
  }

  // ----- Form -----
  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!form.pet_name.trim()) errors.pet_name = '请输入宠物名称'
    if (!form.symptoms.trim()) errors.symptoms = '请输入症状描述'
    if (!form.appointment_date) errors.appointment_date = '请选择预约日期'
    if (!form.appointment_time) errors.appointment_time = '请选择预约时间'
    if (!form.contact_name.trim()) errors.contact_name = '请输入联系人姓名'
    if (!form.contact_phone.trim()) {
      errors.contact_phone = '请输入联系电话'
    } else if (!/^1[3-9]\d{9}$/.test(form.contact_phone.trim())) {
      errors.contact_phone = '请输入有效的手机号码'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setSubmitting(true)
    try {
      const doctorOption = DOCTOR_OPTIONS.find((d) => d.value === Number(form.doctor))
      await createReservation({
        ...form,
        doctor: Number(form.doctor),
        doctor_name: doctorOption ? doctorOption.label : '',
      })
      showToast('预约提交成功', 'success')
      // Reset form
      setForm({
        pet_name: '',
        pet_type: 'dog',
        symptoms: '',
        doctor: 1,
        appointment_date: '',
        appointment_time: '',
        contact_name: user?.username || user?.name || '',
        contact_phone: '',
      })
      setFormErrors({})
      // Switch to list tab
      setActiveTab('list')
      fetchReservations(1)
    } catch (err) {
      const msg = err.response?.data?.message || '预约提交失败'
      showToast(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // ----- Toast -----
  const showToast = (message, type) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
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
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>预约挂号</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', marginBottom: 16, background: 'var(--bg-white)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
        {[
          { key: 'list', label: '我的预约' },
          { key: 'create', label: '新建预约' },
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

      {/* ======== My Reservations Tab ======== */}
      {activeTab === 'list' && (
        <>
          {listLoading ? (
            <div className="spinner" />
          ) : listError ? (
            <div className="card empty-state">
              <div style={{ fontSize: 40, marginBottom: 8 }}>⚠️</div>
              <p style={{ color: 'var(--danger)' }}>{listError}</p>
              <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => fetchReservations(1)}>
                重试
              </button>
            </div>
          ) : reservations.length === 0 ? (
            <div className="card empty-state">
              <div className="icon">📅</div>
              <p>暂无预约记录</p>
              <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setActiveTab('create')}>
                立即预约
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {reservations.map((r) => {
                  const status = r.status || 'pending'
                  const colors = STATUS_COLORS[status] || STATUS_COLORS.pending
                  return (
                    <div
                      key={r.id || r._id}
                      className="card"
                      style={{ padding: 16 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div>
                          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                            {r.pet_name}（{PET_TYPE_NAMES[r.pet_type] || r.pet_type || '未知'}）
                          </h3>
                          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                            {r.doctor_name || '未分配医生'}
                          </p>
                        </div>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '4px 10px',
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 500,
                          background: colors.bg,
                          color: colors.color,
                          border: `1px solid ${colors.border}`,
                        }}>
                          {STATUS_ICONS[status] || ''} {RESERVATION_STATUS[status] || status}
                        </span>
                      </div>

                      <div style={{
                        background: 'var(--bg)',
                        borderRadius: 'var(--radius)',
                        padding: '10px 12px',
                        marginBottom: 12,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>预约时间</span>
                          <span style={{ fontWeight: 500 }}>
                            {formatDateTime(r.appointment_date || r.appointment_datetime || r.createdAt)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 4 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>联系人</span>
                          <span style={{ fontWeight: 500 }}>{r.contact_name || '--'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 4 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>联系电话</span>
                          <span style={{ fontWeight: 500 }}>{r.contact_phone || '--'}</span>
                        </div>
                        {r.symptoms && (
                          <div style={{ fontSize: 13, marginTop: 6, color: 'var(--text-secondary)' }}>
                            症状：{r.symptoms}
                          </div>
                        )}
                      </div>

                      {(status === 'pending' || status === 'confirmed') && (
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ width: '100%' }}
                          onClick={() => handleCancel(r.id || r._id)}
                        >
                          取消预约
                        </button>
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
                    onClick={() => fetchReservations(page - 1)}
                  >
                    上一页
                  </button>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {page} / {totalPages}
                  </span>
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={page >= totalPages}
                    onClick={() => fetchReservations(page + 1)}
                  >
                    下一页
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ======== New Reservation Tab ======== */}
      {activeTab === 'create' && (
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>预约信息</h2>
          <form onSubmit={handleSubmit}>
            {/* 宠物名称 */}
            <div className="form-group">
              <label>宠物名称 *</label>
              <input
                type="text"
                placeholder="请输入宠物名称"
                value={form.pet_name}
                onChange={(e) => handleFormChange('pet_name', e.target.value)}
                style={formErrors.pet_name ? { borderColor: 'var(--danger)' } : {}}
              />
              {formErrors.pet_name && (
                <span style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4, display: 'block' }}>
                  {formErrors.pet_name}
                </span>
              )}
            </div>

            {/* 宠物类型 */}
            <div className="form-group">
              <label>宠物类型 *</label>
              <select
                value={form.pet_type}
                onChange={(e) => handleFormChange('pet_type', e.target.value)}
              >
                {PET_TYPES.map((t) => (
                  <option key={t} value={t}>{PET_TYPE_NAMES[t]}</option>
                ))}
              </select>
            </div>

            {/* 症状描述 */}
            <div className="form-group">
              <label>症状描述 *</label>
              <textarea
                rows={3}
                placeholder="请描述宠物的症状..."
                value={form.symptoms}
                onChange={(e) => handleFormChange('symptoms', e.target.value)}
                style={formErrors.symptoms ? { borderColor: 'var(--danger)' } : {}}
              />
              {formErrors.symptoms && (
                <span style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4, display: 'block' }}>
                  {formErrors.symptoms}
                </span>
              )}
            </div>

            {/* 选择医生 */}
            <div className="form-group">
              <label>选择医生 *</label>
              <select
                value={form.doctor}
                onChange={(e) => handleFormChange('doctor', e.target.value)}
              >
                {DOCTOR_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            {/* 预约日期 + 时间 */}
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>预约日期 *</label>
                <input
                  type="date"
                  min={getToday()}
                  value={form.appointment_date}
                  onChange={(e) => handleFormChange('appointment_date', e.target.value)}
                  style={formErrors.appointment_date ? { borderColor: 'var(--danger)' } : {}}
                />
                {formErrors.appointment_date && (
                  <span style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4, display: 'block' }}>
                    {formErrors.appointment_date}
                  </span>
                )}
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>预约时间 *</label>
                <input
                  type="time"
                  value={form.appointment_time}
                  onChange={(e) => handleFormChange('appointment_time', e.target.value)}
                  style={formErrors.appointment_time ? { borderColor: 'var(--danger)' } : {}}
                />
                {formErrors.appointment_time && (
                  <span style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4, display: 'block' }}>
                    {formErrors.appointment_time}
                  </span>
                )}
              </div>
            </div>

            {/* 联系人 */}
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>联系人姓名 *</label>
                <input
                  type="text"
                  placeholder="请输入联系人姓名"
                  value={form.contact_name}
                  onChange={(e) => handleFormChange('contact_name', e.target.value)}
                  style={formErrors.contact_name ? { borderColor: 'var(--danger)' } : {}}
                />
                {formErrors.contact_name && (
                  <span style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4, display: 'block' }}>
                    {formErrors.contact_name}
                  </span>
                )}
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>联系电话 *</label>
                <input
                  type="tel"
                  placeholder="请输入手机号码"
                  value={form.contact_phone}
                  onChange={(e) => handleFormChange('contact_phone', e.target.value)}
                  style={formErrors.contact_phone ? { borderColor: 'var(--danger)' } : {}}
                />
                {formErrors.contact_phone && (
                  <span style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4, display: 'block' }}>
                    {formErrors.contact_phone}
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={submitting}
              style={{ marginTop: 8, padding: '12px 0', fontSize: 16 }}
            >
              {submitting ? '提交中...' : '确认预约'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
