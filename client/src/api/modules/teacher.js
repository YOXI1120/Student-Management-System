/**
 * 教师相关 API
 */

import request from '../request'

export function getTeachersApi(params) {
  return request.get('/teachers', { params })
}

export function createTeacherApi(data) {
  return request.post('/teachers', data)
}

export function updateTeacherApi(id, data) {
  return request.put(`/teachers/${id}`, data)
}

export function deleteTeacherApi(id) {
  return request.delete(`/teachers/${id}`)
}
