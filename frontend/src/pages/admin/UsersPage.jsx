import { useState, useEffect } from 'react'
import { getUsers } from '../../api/admin'
import DataTable from '../../components/admin/DataTable'
import { formatDateTime } from '../../utils/formatters'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUsers().then(({ data }) => setUsers(data.data || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const columns = [
    { key: 'id', title: 'ID', width: 60 },
    { key: 'username', title: '用户名' },
    { key: 'phone', title: '手机号' },
    { key: 'email', title: '邮箱', render: (v) => v || '--' },
    { key: 'points', title: '积分' },
    { key: 'created_at', title: '注册时间', render: (v) => formatDateTime(v) },
  ]

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 20 }}>用户管理</h2>
      <div className="card">
        <DataTable columns={columns} data={users} loading={loading} emptyText="暂无用户" />
      </div>
    </div>
  )
}
