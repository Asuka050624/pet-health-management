export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const UPLOADS_URL = 'http://localhost:5000/uploads'

export const PET_TYPES = ['dog', 'cat', 'bird', 'fish', 'rabbit', 'other']

export const PET_TYPE_NAMES = {
  dog: '狗狗',
  cat: '猫咪',
  bird: '鸟类',
  fish: '鱼类',
  rabbit: '兔子',
  other: '其他',
}

export const PRODUCT_CATEGORIES = ['食品', '玩具', '服饰', '洗护']

export const ORDER_STATUS = {
  pending: '待付款',
  paid: '已付款',
  shipped: '已发货',
  delivered: '已签收',
  cancelled: '已取消',
}

export const RESERVATION_STATUS = {
  pending: '待确认',
  confirmed: '已确认',
  completed: '已完成',
  cancelled: '已取消',
}
