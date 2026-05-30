/**
 * 学院相关 API
 */

import request from '../request'

export function getCollegesApi() {
  return request.get('/colleges')
}

export function createCollegeApi(data) {
  return request.post('/colleges', data)
}

export function updateCollegeApi(id, data) {
  return request.put(`/colleges/${id}`, data)
}

export function deleteCollegeApi(id) {
  return request.delete(`/colleges/${id}`)
}
