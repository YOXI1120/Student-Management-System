/**
 * 课程相关 API
 */

import request from '../request'

export function getCoursesApi(params) {
  return request.get('/courses', { params })
}

export function createCourseApi(data) {
  return request.post('/courses', data)
}

export function updateCourseApi(id, data) {
  return request.put(`/courses/${id}`, data)
}

export function deleteCourseApi(id) {
  return request.delete(`/courses/${id}`)
}
