/**
 * 班级相关 API
 */

import request from '../request'

export function getClassesApi(params) {
  return request.get('/classes', { params })
}

export function getClassByIdApi(id) {
  return request.get(`/classes/${id}`)
}

export function createClassApi(data) {
  return request.post('/classes', data)
}

export function updateClassApi(id, data) {
  return request.put(`/classes/${id}`, data)
}

export function deleteClassApi(id) {
  return request.delete(`/classes/${id}`)
}
