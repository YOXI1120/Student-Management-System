/**
 * 排课管理控制器（薄层）
 */

import * as scheduleService from '../services/scheduleService.js';
import Response from '../utils/response.js';

export async function getSchedules(req, res) {
  try {
    const result = await scheduleService.getSchedules(req.query, req.user);
    return res.json(Response.success(result));
  } catch (err) {
    console.error('查询排课列表出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function createSchedule(req, res) {
  try {
    const { course_id, teacher_id, class_id, semester, academic_year, day_of_week, start_period, end_period } = req.body;
    if (!course_id || !teacher_id || !class_id || !semester || !academic_year || !day_of_week || !start_period || !end_period) {
      return res.status(400).json(Response.badRequest('缺少必要参数'));
    }
    const result = await scheduleService.createSchedule(req.body);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.status(201).json(Response.created(result, '排课成功'));
  } catch (err) {
    console.error('创建排课出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function deleteSchedule(req, res) {
  try {
    const result = await scheduleService.deleteSchedule(req.params.id);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.json(Response.success(null, '删除成功'));
  } catch (err) {
    console.error('删除排课出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function getSchedulesByClass(req, res) {
  try {
    const result = await scheduleService.getSchedulesByClass(req.params.id);
    return res.json(Response.success(result));
  } catch (err) {
    console.error('按班级查询排课出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}
