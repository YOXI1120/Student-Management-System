/**
 * 用户管理 API
 */

import request from '../request'

export function getUsersApi(params) {
  return request.get('/users', { params })
}

export function createUserApi(data) {
  return request.post('/users', data)
}

export function updateUserApi(id, data) {
  return request.put(`/users/${id}`, data)
}

export function deleteUserApi(id) {
  return request.delete(`/users/${id}`)
}
