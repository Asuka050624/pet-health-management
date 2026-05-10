export default function Loading({ text = '加载中...' }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div className="spinner" />
      <p style={{ marginTop: 16, color: 'var(--text-hint)', fontSize: 14 }}>{text}</p>
    </div>
  )
}
