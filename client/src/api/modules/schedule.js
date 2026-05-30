/**
 * 排课相关 API
 */

import request from '../request'

export function getSchedulesApi(params) {
  return request.get('/schedules', { params })
}

export function createScheduleApi(data) {
  return request.post('/schedules', data)
}

export function deleteScheduleApi(id) {
  return request.delete(`/schedules/${id}`)
}

export function getSchedulesByClassApi(id) {
  return request.get(`/schedules/by-class/${id}`)
}
