/**
 * 公告相关 API
 */

import request from '../request'

export function getAnnouncementsApi() {
  return request.get('/announcements')
}

export function getLatestAnnouncementsApi() {
  return request.get('/announcements/latest')
}

export function createAnnouncementApi(data) {
  return request.post('/announcements', data)
}

export function updateAnnouncementApi(id, data) {
  return request.put(`/announcements/${id}`, data)
}

export function deleteAnnouncementApi(id) {
  return request.delete(`/announcements/${id}`)
}
