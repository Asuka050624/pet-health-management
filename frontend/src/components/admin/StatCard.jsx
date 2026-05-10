export default function StatCard({ icon, label, value, color = 'blue' }) {
  const colors = {
    blue: '#E7F5FF',
    green: '#D4EDDA',
    orange: '#FFF3CD',
    red: '#F8D7DA',
    purple: '#E8E0F0',
    teal: '#D1F2EB',
  }

  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
      <div style={{
        width: 56, height: 56, borderRadius: 12,
        background: colors[color] || colors.blue,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>{value}</div>
        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{label}</div>
      </div>
    </div>
  )
}
