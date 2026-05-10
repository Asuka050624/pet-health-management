import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import api from '../../api/axios'

const CAROUSEL_IMAGES = [
  '/images/carousel1.png',
  '/images/carousel2.png',
  '/images/carousel3.png',
]

const FEATURE_IMAGES = {
  news: '/images/news.png',
  reservation: '/images/reservation.png',
  shop: '/images/shop.png',
  feedback: '/images/feedback.png',
}

const featureModules = [
  { to: '/mobile/news', key: 'news', label: '宠物资讯' },
  { to: '/mobile/reservation', key: 'reservation', label: '挂号预约' },
  { to: '/mobile/shop', key: 'shop', label: '宠物商城' },
  { to: '/mobile/feedback', key: 'feedback', label: '反馈中心' },
]

const PRODUCT_IMAGES = {
  1: '/images/product1.jpg',
  2: '/images/product2.jpg',
  3: '/images/product3.jpg',
  4: '/images/product4.jpg',
  5: '/images/product5.jpg',
  6: '/images/product6.jpg',
}

const NEWS_IMAGES = {
  1: '/images/news1.jpg',
  2: '/images/news2.jpg',
  3: '/images/news3.jpg',
  4: '/images/news4.jpg',
  5: '/images/news5.jpg',
}

export default function HomePage() {
  const { user } = useContext(AuthContext)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [news, setNews] = useState([])
  const [products, setProducts] = useState([])

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % CAROUSEL_IMAGES.length), 3000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    api.get('/news?per_page=3').then(({ data }) => setNews(data.data || [])).catch(() => {})
    api.get('/products?per_page=3').then(({ data }) => setProducts(data.data || [])).catch(() => {})
  }, [])

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 20 }}>宠物健康管理</h2>
          <p style={{ fontSize: 12, color: 'var(--text-hint)' }}>
            {user ? `欢迎回来，${user.username}` : '关爱宠物每一天'}
          </p>
        </div>
        {!user && (
          <Link to="/auth/login" className="btn btn-primary btn-sm">登录</Link>
        )}
      </div>

      {/* Carousel */}
      <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', marginBottom: 20, height: 160 }}>
        {CAROUSEL_IMAGES.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`轮播${i + 1}`}
            style={{
              position: 'absolute', top: 0, left: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              opacity: i === currentSlide ? 1 : 0,
              transition: 'opacity 0.5s ease',
            }}
          />
        ))}
        <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
          {CAROUSEL_IMAGES.map((_, i) => (
            <span key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: i === currentSlide ? '#fff' : 'rgba(255,255,255,0.5)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>
      </div>

      {/* Feature Modules */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {featureModules.map((m) => (
          <Link
            key={m.to}
            to={m.to}
            style={{
              background: '#fff', borderRadius: 12, padding: '16px 8px',
              textAlign: 'center', boxShadow: 'var(--shadow)',
            }}
          >
            <img src={FEATURE_IMAGES[m.key]} alt={m.label}
              style={{ width: 40, height: 40, objectFit: 'contain', marginBottom: 6 }} />
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{m.label}</div>
          </Link>
        ))}
      </div>

      {/* News Section */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 16 }}>宠物资讯</h3>
          <Link to="/mobile/news" style={{ fontSize: 13, color: 'var(--primary)' }}>更多</Link>
        </div>
        {news.length === 0 ? (
          <div className="empty-state"><p>暂无资讯</p></div>
        ) : (
          news.map((item) => {
            const img = NEWS_IMAGES[item.id] || '/images/news1.jpg'
            return (
              <Link key={item.id} to={`/mobile/news/${item.id}`}
                style={{ display: 'flex', gap: 12, background: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, boxShadow: 'var(--shadow)' }}>
                <img src={img} alt={item.title}
                  style={{ width: 80, height: 60, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                  onError={(e) => { e.target.style.display = 'none' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: 14, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</h4>
                  <p style={{ fontSize: 12, color: 'var(--text-hint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.summary || ''}</p>
                </div>
              </Link>
            )
          })
        )}
      </div>

      {/* Products Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 16 }}>热门推荐</h3>
          <Link to="/mobile/shop" style={{ fontSize: 13, color: 'var(--primary)' }}>更多</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {products.map((product) => {
            const img = PRODUCT_IMAGES[product.id] || '/images/product1.jpg'
            return (
              <Link key={product.id} to="/mobile/shop"
                style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                <img src={img} alt={product.name}
                  style={{ width: '100%', height: 120, objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none' }}
                />
                <div style={{ padding: 10 }}>
                  <h4 style={{ fontSize: 13, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ color: '#F44336', fontWeight: 600, fontSize: 15 }}>¥{Number(product.price).toFixed(2)}</span>
                    {product.original_price && (
                      <span style={{ fontSize: 11, color: 'var(--text-hint)', textDecoration: 'line-through' }}>¥{Number(product.original_price).toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
