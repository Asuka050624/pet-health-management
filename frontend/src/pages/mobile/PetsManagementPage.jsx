import { useState, useEffect, useCallback } from 'react'
import { getPets, createPet, updatePet, deletePet } from '../../api/pets'
import { PET_TYPES, PET_TYPE_NAMES } from '../../utils/constants'
import { useToast } from '../../components/common/Toast'

const INITIAL_FORM = {
  name: '',
  type: 'dog',
  breed: '',
  age: '',
  gender: 'unknown',
  birthday: '',
}

const GENDER_OPTIONS = [
  { value: 'male', label: '公' },
  { value: 'female', label: '母' },
  { value: 'unknown', label: '未知' },
]

function PetFormModal({ visible, pet, onClose, onSubmit }) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (pet) {
      setForm({
        name: pet.name || '',
        type: pet.type || 'dog',
        breed: pet.breed || '',
        age: pet.age ?? '',
        gender: pet.gender || 'unknown',
        birthday: pet.birthday ? pet.birthday.slice(0, 10) : '',
      })
    } else {
      setForm(INITIAL_FORM)
    }
    setError('')
  }, [pet, visible])

  if (!visible) return null

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('宠物名称不能为空')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        age: form.age ? Number(form.age) : undefined,
        breed: form.breed.trim() || undefined,
        birthday: form.birthday || undefined,
      }
      await onSubmit(payload)
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || '操作失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ width: '90%', maxWidth: 420, padding: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: 18, marginBottom: 20, textAlign: 'center' }}>
          {pet ? '编辑宠物信息' : '添加宠物'}
        </h3>

        {error && (
          <div style={{
            background: '#FFF3F0', color: '#D32F2F', padding: '10px 14px',
            borderRadius: 8, fontSize: 13, marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>宠物名称 *</label>
            <input
              type="text"
              value={form.name}
              onChange={handleChange('name')}
              placeholder="请输入宠物名称"
              maxLength={20}
            />
          </div>

          <div className="form-group">
            <label>宠物类型</label>
            <select value={form.type} onChange={handleChange('type')}>
              {PET_TYPES.map((t) => (
                <option key={t} value={t}>{PET_TYPE_NAMES[t] || t}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>品种</label>
            <input
              type="text"
              value={form.breed}
              onChange={handleChange('breed')}
              placeholder="请输入品种"
              maxLength={30}
            />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>年龄（岁）</label>
              <input
                type="number"
                value={form.age}
                onChange={handleChange('age')}
                placeholder="年龄"
                min={0}
                max={50}
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label>性别</label>
              <select value={form.gender} onChange={handleChange('gender')}>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>生日</label>
            <input
              type="date"
              value={form.birthday}
              onChange={handleChange('birthday')}
              max={new Date().toISOString().slice(0, 10)}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ flex: 1 }}
              onClick={onClose}
            >
              取消
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={submitting}
            >
              {submitting ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteConfirmModal({ visible, petName, onConfirm, onClose }) {
  const [deleting, setDeleting] = useState(false)

  if (!visible) return null

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onConfirm()
      onClose()
    } catch {
      // error handled by parent
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ width: '85%', maxWidth: 360, padding: 24, textAlign: 'center' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>😿</div>
        <h3 style={{ fontSize: 17, marginBottom: 8 }}>确认删除</h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
          确定要删除宠物「{petName}」吗？此操作无法撤销。
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>
            取消
          </button>
          <button
            className="btn btn-danger"
            style={{ flex: 1 }}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? '删除中...' : '确认删除'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PetsManagementPage() {
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [formVisible, setFormVisible] = useState(false)
  const [editingPet, setEditingPet] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const showToast = useToast()

  const fetchPets = useCallback(async () => {
    setLoading(true)
    setFetchError('')
    try {
      const { data } = await getPets()
      setPets(data.data || [])
    } catch (err) {
      setFetchError(err.response?.data?.error || '加载宠物列表失败')
      setPets([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPets()
  }, [fetchPets])

  const handleCreate = async (payload) => {
    await createPet(payload)
    showToast('宠物添加成功')
    await fetchPets()
  }

  const handleUpdate = async (payload) => {
    if (!editingPet) return
    await updatePet(editingPet.id, payload)
    showToast('宠物信息已更新')
    await fetchPets()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deletePet(deleteTarget.id)
    showToast('宠物已删除')
    setDeleteTarget(null)
    await fetchPets()
  }

  const openCreateForm = () => {
    setEditingPet(null)
    setFormVisible(true)
  }

  const openEditForm = (pet) => {
    setEditingPet(pet)
    setFormVisible(true)
  }

  const closeForm = () => {
    setFormVisible(false)
    setEditingPet(null)
  }

  const getGenderLabel = (gender) => {
    const map = { male: '♂ 公', female: '♀ 母', unknown: '未知' }
    return map[gender] || '未知'
  }

  const getGenderColor = (gender) => {
    if (gender === 'male') return '#2196F3'
    if (gender === 'female') return '#E91E63'
    return '#757575'
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div className="spinner" />
        <p style={{ marginTop: 16, color: 'var(--text-secondary)', fontSize: 14 }}>加载中...</p>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>😿</div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>{fetchError}</p>
        <button className="btn btn-outline btn-sm" onClick={fetchPets}>重试</button>
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
        <div>
          <h2 style={{ fontSize: 18 }}>我的宠物</h2>
          <p style={{ fontSize: 12, color: 'var(--text-hint)' }}>
            共 {pets.length} 只宠物
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openCreateForm}>
          + 添加宠物
        </button>
      </div>

      {/* Pet List */}
      {pets.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 64, marginBottom: 12 }}>🐾</div>
          <p>还没有添加宠物</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>点击上方按钮添加您的第一只宠物吧</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pets.map((pet) => (
            <div
              key={pet.id}
              style={{
                background: 'var(--bg-white)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow)',
                padding: 16,
                display: 'flex',
                gap: 14,
              }}
            >
              {/* Pet Avatar */}
              <div style={{
                width: 72,
                height: 72,
                borderRadius: 'var(--radius-lg)',
                background: '#E8F5E9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36,
                flexShrink: 0,
              }}>
                {pet.type === 'dog' ? '🐕' :
                 pet.type === 'cat' ? '🐈' :
                 pet.type === 'bird' ? '🐦' :
                 pet.type === 'fish' ? '🐟' :
                 pet.type === 'rabbit' ? '🐰' : '🐾'}
              </div>

              {/* Pet Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <h4 style={{ fontSize: 16 }}>{pet.name}</h4>
                  <span style={{
                    fontSize: 10,
                    padding: '2px 6px',
                    borderRadius: 10,
                    background: '#E8F5E9',
                    color: '#2E7D32',
                  }}>
                    {PET_TYPE_NAMES[pet.type] || pet.type}
                  </span>
                  <span style={{
                    fontSize: 12,
                    color: getGenderColor(pet.gender),
                  }}>
                    {getGenderLabel(pet.gender)}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  {pet.breed ? `品种：${pet.breed}` : '品种：未填写'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  年龄：{pet.age != null ? `${pet.age} 岁` : '未填写'}
                  {pet.birthday && (
                    <span style={{ marginLeft: 12 }}>生日：{pet.birthday.slice(0, 10)}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <button
                  className="btn btn-outline btn-sm"
                  style={{ padding: '4px 10px', fontSize: 12 }}
                  onClick={() => openEditForm(pet)}
                >
                  编辑
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  style={{ padding: '4px 10px', fontSize: 12 }}
                  onClick={() => setDeleteTarget(pet)}
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <PetFormModal
        visible={formVisible}
        pet={editingPet}
        onClose={closeForm}
        onSubmit={editingPet ? handleUpdate : handleCreate}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        visible={!!deleteTarget}
        petName={deleteTarget?.name || ''}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
