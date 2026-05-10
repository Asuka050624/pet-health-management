export default function StatusBadge({ status, mapping = {} }) {
  const defaultMapping = {
    pending: { label: '待处理', bg: '#FFF3CD', color: '#856404' },
    processing: { label: '处理中', bg: '#CCE5FF', color: '#004085' },
    confirmed: { label: '已确认', bg: '#CCE5FF', color: '#004085' },
    replied: { label: '已回复', bg: '#D4EDDA', color: '#155724' },
    completed: { label: '已完成', bg: '#D4EDDA', color: '#155724' },
    paid: { label: '已付款', bg: '#CCE5FF', color: '#004085' },
    shipped: { label: '已发货', bg: '#E8DCF0', color: '#6C3483' },
    delivered: { label: '已签收', bg: '#D4EDDA', color: '#155724' },
    cancelled: { label: '已取消', bg: '#F1F1F1', color: '#666' },
    closed: { label: '已关闭', bg: '#F1F1F1', color: '#666' },
    active: { label: '正常', bg: '#D4EDDA', color: '#155724' },
    inactive: { label: '已禁用', bg: '#F8D7DA', color: '#721C24' },
    suggestion: { label: '建议', bg: '#CCE5FF', color: '#004085' },
    bug: { label: '问题', bg: '#FFF3CD', color: '#856404' },
    compliment: { label: '好评', bg: '#D4EDDA', color: '#155724' },
    other: { label: '其他', bg: '#F1F1F1', color: '#666' },
    ...mapping,
  }

  const config = defaultMapping[status] || { label: status, bg: '#F1F1F1', color: '#666' }

  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 10,
      fontSize: 12, fontWeight: 500,
      background: config.bg, color: config.color,
    }}>
      {config.label}
    </span>
  )
}
