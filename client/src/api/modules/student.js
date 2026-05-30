/**
 * 学生相关 API
 */

import request from '../request'

export function getStudentsApi(params) {
  return request.get('/students', { params })
}

export function getStudentByIdApi(id) {
  return request.get(`/students/${id}`)
}

export function createStudentApi(data) {
  return request.post('/students', data)
}

export function updateStudentApi(id, data) {
  return request.put(`/students/${id}`, data)
}

export function deleteStudentApi(id) {
  return request.delete(`/students/${id}`)
}

export function changeStudentStatusApi(id, data) {
  return request.post(`/students/${id}/change-status`, data)
}

export function getStatusLogsApi(id) {
  return request.get(`/students/${id}/status-logs`)
}
