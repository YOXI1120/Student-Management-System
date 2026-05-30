/**
 * 选课相关 API
 */

import request from '../request'

export function getMyCoursesApi() {
  return request.get('/student-courses')
}

export function getAvailableCoursesApi() {
  return request.get('/student-courses/available')
}

export function selectCourseApi(data) {
  return request.post('/student-courses/select', data)
}

export function dropCourseApi(id) {
  return request.delete(`/student-courses/${id}/drop`)
}

export function getScheduleApi() {
  return request.get('/student-courses/schedule')
}

export function autoAssignCoursesApi(data) {
  return request.post('/student-courses/auto-assign', data)
}

export function getStudentCoursesByScheduleApi(scheduleId) {
  return request.get(`/student-courses/by-schedule/${scheduleId}`)
}
