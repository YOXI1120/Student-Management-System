/**
 * 认证相关 API
 */

import request from '../request'

export function loginApi(data) {
  return request.post('/auth/login', data)
}

export function getProfileApi() {
  return request.get('/auth/profile')
}

export function changePasswordApi(data) {
  return request.put('/auth/password', data)
}
