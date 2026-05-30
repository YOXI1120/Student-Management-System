/**
 * 成绩相关 API
 */

import request from '../request'

export function getScoresApi(params) {
  return request.get('/scores', { params })
}

export function batchSaveScoresApi(data) {
  return request.post('/scores/batch', data)
}

export function getStudentScoresApi(id) {
  return request.get(`/scores/student/${id}`)
}

export function getScoreStatisticsApi(params) {
  return request.get('/scores/statistics', { params })
}
