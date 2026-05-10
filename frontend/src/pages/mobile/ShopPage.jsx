import { useState, useEffect, useContext, useCallback } from 'react'
import { getProducts, getProduct } from '../../api/products'
import { createOrder } from '../../api/orders'
import { PRODUCT_CATEGORIES } from '../../utils/constants'
import { formatPrice } from '../../utils/formatters'
import { CartContext } from '../../context/CartContext'
import { useToast } from '../../components/common/Toast'

const ALL_TABS = ['全部', ...PRODUCT_CATEGORIES]

function getProductImage(productId) {
  return `/images/product${productId}.jpg`
}

function ProductDetailModal({ visible, product, loading, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

  if (!visible) return null

  const handleAdd = async () => {
    if (!product) return
    setAdding(true)
    try {
      await onAddToCart(product.id, quantity)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{
          width: '90%',
          maxWidth: 420,
          maxHeight: '85vh',
          overflowY: 'auto',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-white)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div className="spinner" />
          </div>
        ) : product ? (
          <>
            {/* Product Image */}
            <img
              src={product.image || getProductImage(product.id)}
              alt={product.name}
              style={{
                width: '100%', height: 220, objectFit: 'cover',
                borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
              }}
              onError={(e) => { e.target.src = '/images/product1.jpg' }}
            />

            <div style={{ padding: 20 }}>
              {/* Product Name & Category */}
              <h3 style={{ fontSize: 18, marginBottom: 6 }}>{product.name}</h3>
              {product.category && (
                <span style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: 10,
                  fontSize: 11,
                  background: '#E8F5E9',
                  color: '#2E7D32',
                  marginBottom: 12,
                }}>
                  {product.category}
                </span>
              )}

              {/* Price */}
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 8,
                marginBottom: 16,
                paddingBottom: 16,
                borderBottom: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: '#F44336' }}>
                  {formatPrice(product.price)}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span style={{
                    fontSize: 14,
                    color: 'var(--text-hint)',
                    textDecoration: 'line-through',
                  }}>
                    {formatPrice(product.original_price)}
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>商品详情</h4>
                  <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7 }}>
                    {product.description}
                  </p>
                </div>
              )}

              {/* Stock & Sales */}
              <div style={{
                display: 'flex',
                gap: 16,
                fontSize: 13,
                color: 'var(--text-secondary)',
                marginBottom: 16,
              }}>
                <span>库存：{product.stock != null ? `${product.stock} 件` : '充足'}</span>
                {product.sales != null && <span>销量：{product.sales}</span>}
              </div>

              {/* Quantity & Add to Cart */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                paddingTop: 12,
                borderTop: '1px solid var(--border)',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  overflow: 'hidden',
                }}>
                  <button
                    style={{
                      width: 36,
                      height: 36,
                      background: 'var(--bg)',
                      border: 'none',
                      fontSize: 18,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span style={{
                    width: 44,
                    textAlign: 'center',
                    fontSize: 15,
                    fontWeight: 500,
                  }}>
                    {quantity}
                  </span>
                  <button
                    style={{
                      width: 36,
                      height: 36,
                      background: 'var(--bg)',
                      border: 'none',
                      fontSize: 18,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    +
                  </button>
                </div>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, height: 40 }}
                  onClick={handleAdd}
                  disabled={adding}
                >
                  {adding ? '添加中...' : '加入购物车'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 40 }}>商品不存在</div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.4)',
            color: '#fff',
            border: 'none',
            fontSize: 16,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}

function CartPanel({ visible, onClose }) {
  const { items, totalCount, totalPrice, updateQuantity, removeFromCart, clearCart } = useContext(CartContext)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paying, setPaying] = useState(false)
  const showToast = useToast()

  if (!visible) return null

  const handlePayment = async (method) => {
    if (items.length === 0) {
      showToast('购物车为空', 'error')
      return
    }
    setPaying(true)
    try {
      await createOrder(method)
      showToast('下单成功！')
      await clearCart()
      setShowPaymentModal(false)
      onClose()
    } catch (err) {
      showToast(err.response?.data?.error || '下单失败，请稍后重试', 'error')
    } finally {
      setPaying(false)
    }
  }

  return (
    <>
      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" style={{ zIndex: 10001 }} onClick={() => setShowPaymentModal(false)}>
          <div
            className="modal-content"
            style={{ width: '85%', maxWidth: 360, padding: 24, zIndex: 10002 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 17, textAlign: 'center', marginBottom: 8 }}>确认支付</h3>
            <p style={{
              textAlign: 'center',
              fontSize: 13,
              color: 'var(--text-secondary)',
              marginBottom: 16,
            }}>
              订单金额：<span style={{ fontSize: 20, fontWeight: 700, color: '#F44336' }}>
                {formatPrice(totalPrice)}
              </span>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={() => handlePayment('wechat')}
                disabled={paying}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 16px',
                  borderRadius: 'var(--radius)',
                  border: '2px solid #07C160',
                  background: '#F0FFF4',
                  cursor: 'pointer',
                  fontSize: 15,
                }}
              >
                <span style={{ fontSize: 28 }}>💚</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, color: '#07C160' }}>微信支付</div>
                  <div style={{ fontSize: 12, color: 'var(--text-hint)' }}>推荐安装微信的用户使用</div>
                </div>
              </button>

              <button
                onClick={() => handlePayment('alipay')}
                disabled={paying}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 16px',
                  borderRadius: 'var(--radius)',
                  border: '2px solid #1677FF',
                  background: '#F0F7FF',
                  cursor: 'pointer',
                  fontSize: 15,
                }}
              >
                <span style={{ fontSize: 28 }}>💙</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, color: '#1677FF' }}>支付宝</div>
                  <div style={{ fontSize: 12, color: 'var(--text-hint)' }}>推荐安装支付宝的用户使用</div>
                </div>
              </button>
            </div>

            <button
              className="btn btn-outline btn-block"
              style={{ marginTop: 16 }}
              onClick={() => setShowPaymentModal(false)}
              disabled={paying}
            >
              {paying ? '支付中...' : '取消'}
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 9998,
        }}
        onClick={onClose}
      />

      {/* Cart Panel */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '85%',
        maxWidth: 380,
        background: 'var(--bg-white)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
        animation: 'shopCartSlideIn 0.3s ease',
      }}>
        {/* Cart Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
        }}>
          <h3 style={{ fontSize: 17 }}>
            购物车
            {totalCount > 0 && (
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginLeft: 6 }}>
                ({totalCount})
              </span>
            )}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 20,
              color: 'var(--text-hint)',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            ✕
          </button>
        </div>

        {/* Cart Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>购物车是空的</p>
              <p style={{ color: 'var(--text-hint)', fontSize: 12, marginTop: 4 }}>
                快去挑选心仪的商品吧
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map((item) => {
                const pid = item.product_id || item.id
                return (
                  <div
                    key={pid}
                    style={{
                      display: 'flex',
                      gap: 10,
                      padding: 12,
                      background: 'var(--bg)',
                      borderRadius: 'var(--radius)',
                    }}
                  >
                    {/* Item Image */}
                    <img
                      src={item.image || getProductImage(pid)}
                      alt={item.product_name || item.name}
                      style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                      onError={(e) => { e.target.src = '/images/product1.jpg' }}
                    />

                    {/* Item Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{
                        fontSize: 14,
                        marginBottom: 4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {item.product_name || item.name || `商品 #${pid}`}
                      </h4>
                      <p style={{ fontSize: 15, fontWeight: 600, color: '#F44336', marginBottom: 6 }}>
                        {formatPrice(item.price)}
                      </p>

                      {/* Quantity Controls */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          border: '1px solid var(--border)',
                          borderRadius: 6,
                          overflow: 'hidden',
                          background: '#fff',
                        }}>
                          <button
                            style={{
                              width: 28,
                              height: 28,
                              border: 'none',
                              background: 'transparent',
                              fontSize: 16,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantity(pid, item.quantity - 1)
                              }
                            }}
                          >
                            -
                          </button>
                          <span style={{ width: 32, textAlign: 'center', fontSize: 13 }}>
                            {item.quantity || 1}
                          </span>
                          <button
                            style={{
                              width: 28,
                              height: 28,
                              border: 'none',
                              background: 'transparent',
                              fontSize: 16,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            onClick={() => updateQuantity(pid, (item.quantity || 1) + 1)}
                          >
                            +
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(pid)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-hint)',
                            fontSize: 12,
                            cursor: 'pointer',
                            padding: '2px 4px',
                          }}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {items.length > 0 && (
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-white)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>合计</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#F44336' }}>
                {formatPrice(totalPrice)}
              </span>
            </div>
            <button
              className="btn btn-primary btn-block"
              style={{ height: 44, fontSize: 16 }}
              onClick={() => setShowPaymentModal(true)}
            >
              去结算
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shopCartSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}

export default function ShopPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('全部')
  const [detailProduct, setDetailProduct] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const { totalCount, addToCart, fetchCart } = useContext(CartContext)
  const showToast = useToast()

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (activeTab !== '全部') {
        params.category = activeTab
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }
      const { data } = await getProducts(params)
      setProducts(data.data || [])
    } catch (err) {
      setError(err.response?.data?.error || '加载商品失败')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [activeTab, searchQuery])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleProductClick = async (product) => {
    setShowDetail(true)
    setDetailProduct(product)
    setDetailLoading(true)
    try {
      const { data } = await getProduct(product.id)
      setDetailProduct(data.data || product)
    } catch {
      // keep the basic product info from the list
    } finally {
      setDetailLoading(false)
    }
  }

  const handleAddToCart = async (productId, quantity = 1) => {
    try {
      await addToCart(productId, quantity)
      showToast('已添加到购物车')
    } catch (err) {
      showToast(err.response?.data?.error || '添加失败，请稍后重试', 'error')
    }
  }

  const handleCloseDetail = () => {
    setShowDetail(false)
    setDetailProduct(null)
  }

  const handleOpenCart = () => {
    fetchCart()
    setShowCart(true)
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
        <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>{error}</p>
        <button className="btn btn-outline btn-sm" onClick={fetchProducts}>重试</button>
      </div>
    )
  }

  return (
    <div>
      {/* Search Bar & Cart Icon */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
      }}>
        <div style={{
          flex: 1,
          position: 'relative',
        }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索商品..."
            style={{
              width: '100%',
              padding: '10px 14px 10px 36px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 14,
              outline: 'none',
              background: 'var(--bg-white)',
            }}
          />
          <span style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 16,
            color: 'var(--text-hint)',
            pointerEvents: 'none',
          }}>
            🔍
          </span>
        </div>

        {/* Cart Icon */}
        <button
          onClick={handleOpenCart}
          style={{
            position: 'relative',
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: 'var(--bg-white)',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          🛒
          {totalCount > 0 && (
            <span style={{
              position: 'absolute',
              top: -4,
              right: -4,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              background: '#F44336',
              color: '#fff',
              fontSize: 11,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
            }}>
              {totalCount > 99 ? '99+' : totalCount}
            </span>
          )}
        </button>
      </div>

      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 16,
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        paddingBottom: 4,
      }}>
        {ALL_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '7px 16px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: activeTab === tab ? 600 : 400,
              background: activeTab === tab ? 'var(--primary)' : 'var(--bg-white)',
              color: activeTab === tab ? '#fff' : 'var(--text-secondary)',
              border: activeTab === tab ? 'none' : '1px solid var(--border)',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.2s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48, marginBottom: 12 }}>🛍️</div>
          <p>{searchQuery ? '未找到匹配的商品' : '暂无商品'}</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>
            {searchQuery ? '试试其他关键词吧' : '商品正在上架中，敬请期待'}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
        }}>
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product)}
              style={{
                background: 'var(--bg-white)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow)',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {/* Product Image */}
              <img
                src={product.image || getProductImage(product.id)}
                alt={product.name}
                style={{ width: '100%', height: 140, objectFit: 'cover' }}
                onError={(e) => { e.target.src = '/images/product1.jpg' }}
              />

              {/* Product Info */}
              <div style={{ padding: 10 }}>
                <h4 style={{
                  fontSize: 13,
                  marginBottom: 6,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.4,
                }}>
                  {product.name}
                </h4>
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 6,
                  marginBottom: 8,
                }}>
                  <span style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: '#F44336',
                  }}>
                    {formatPrice(product.price)}
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <span style={{
                      fontSize: 11,
                      color: 'var(--text-hint)',
                      textDecoration: 'line-through',
                    }}>
                      {formatPrice(product.original_price)}
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <button
                  className="btn btn-primary btn-sm btn-block"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAddToCart(product.id, 1)
                  }}
                  style={{ fontSize: 13, padding: '6px 0' }}
                >
                  加入购物车
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        visible={showDetail}
        product={detailProduct}
        loading={detailLoading}
        onClose={handleCloseDetail}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Slide-out Panel */}
      <CartPanel
        visible={showCart}
        onClose={() => setShowCart(false)}
      />
    </div>
  )
}
