import { useState, useEffect } from 'react'
import { getAdminProducts, createProduct, updateProduct, deleteProduct } from '../../api/admin'
import { formatPrice } from '../../utils/formatters'
import StatusBadge from '../../components/admin/StatusBadge'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', category: '食品', price: '', original_price: '', description: '', stock: 0, image: '' })
  const [saving, setSaving] = useState(false)

  const fetchProducts = () => {
    setLoading(true)
    getAdminProducts().then(({ data }) => setProducts(data.data || [])).finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', category: '食品', price: '', original_price: '', description: '', stock: 0, image: '' })
    setShowForm(true)
  }

  const openEdit = (product) => {
    setEditing(product)
    setForm({
      name: product.name, category: product.category, price: String(product.price),
      original_price: product.original_price ? String(product.original_price) : '',
      description: product.description || '', stock: product.stock, image: product.image || '',
    })
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name || !form.price) return alert('请填写商品名称和价格')
    setSaving(true)
    try {
      const data = { ...form, price: parseFloat(form.price), original_price: form.original_price ? parseFloat(form.original_price) : null, stock: parseInt(form.stock) || 0 }
      if (editing) {
        await updateProduct(editing.id, data)
      } else {
        await createProduct(data)
      }
      setShowForm(false)
      fetchProducts()
    } catch (err) {
      alert(err.response?.data?.error || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`确定要下架商品 "${product.name}" 吗？`)) return
    try {
      await deleteProduct(product.id)
      fetchProducts()
    } catch (err) {
      alert(err.response?.data?.error || '操作失败')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 22 }}>商品管理</h2>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>添加商品</button>
      </div>

      <div className="card">
        {loading ? <div className="spinner" /> : products.length === 0 ? (
          <div className="empty-state"><div className="icon">📦</div><p>暂无商品</p></div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {products.map((p) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, border: '1px solid var(--border)', borderRadius: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</span>
                    <StatusBadge status={p.is_active ? 'active' : 'inactive'} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-hint)', marginTop: 4 }}>
                    分类: {p.category} | 价格: {formatPrice(p.price)} | 库存: {p.stock} | 销量: {p.sales}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>编辑</button>
                  <button className="btn btn-sm" style={{ background: '#F44336', color: '#fff' }} onClick={() => handleDelete(p)}>下架</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" style={{ padding: 24, width: 500, maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 20 }}>{editing ? '编辑商品' : '添加商品'}</h3>
            <form onSubmit={handleSave}>
              <div className="form-group"><label>商品名称 *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-group"><label>分类</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="食品">食品</option><option value="玩具">玩具</option><option value="服饰">服饰</option><option value="洗护">洗护</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group"><label>价格 *</label><input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
                <div className="form-group"><label>原价</label><input type="number" step="0.01" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>库存</label><input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
              <div className="form-group"><label>描述</label><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="form-group"><label>图片URL</label><input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
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
