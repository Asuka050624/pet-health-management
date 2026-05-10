import api from './axios'

export function login(username, password) {
  return api.post('/auth/login', { username, password })
}

export function register(data) {
  return api.post('/auth/register', data)
}

export function getMe() {
  return api.get('/auth/me')
}

export function changePassword(data) {
  return api.put('/auth/change-password', data)
}

export function adminLogin(username, password) {
  return api.post('/auth/admin/login', { username, password })
}

export function getAdminMe() {
  return api.get('/auth/admin/me')
}
