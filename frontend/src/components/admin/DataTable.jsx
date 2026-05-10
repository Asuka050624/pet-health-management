export default function DataTable({ columns, data, loading, emptyText = '暂无数据' }) {
  if (loading) return <div className="spinner" />
  if (!data || data.length === 0) {
    return <div className="empty-state"><div className="icon">📋</div><p>{emptyText}</p></div>
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{
                padding: '12px 16px', textAlign: 'left',
                borderBottom: '2px solid var(--border)', color: 'var(--text-secondary)',
                fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap',
                width: col.width,
              }}>
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i} style={{ borderBottom: '1px solid #f0f0f0' }}>
              {columns.map((col) => (
                <td key={col.key} style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
