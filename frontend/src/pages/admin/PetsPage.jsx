import { useState, useEffect } from 'react'
import { getAllPets } from '../../api/admin'
import DataTable from '../../components/admin/DataTable'
import { PET_TYPE_NAMES } from '../../utils/constants'
import { formatDate } from '../../utils/formatters'

export default function PetsPage() {
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllPets().then(({ data }) => setPets(data.data || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const columns = [
    { key: 'id', title: 'ID', width: 60 },
    { key: 'name', title: '宠物名称' },
    { key: 'type', title: '类型', render: (v) => PET_TYPE_NAMES[v] || v },
    { key: 'breed', title: '品种', render: (v) => v || '--' },
    { key: 'age', title: '年龄', render: (v) => v ? `${v}岁` : '--' },
    { key: 'gender', title: '性别', render: (v) => ({ male: '公', female: '母', unknown: '未知' })[v] || '--' },
    { key: 'created_at', title: '添加时间', render: (v) => formatDate(v) },
  ]

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 20 }}>宠物管理</h2>
      <div className="card">
        <DataTable columns={columns} data={pets} loading={loading} emptyText="暂无宠物" />
      </div>
    </div>
  )
}
