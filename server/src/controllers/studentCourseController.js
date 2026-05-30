/**
 * 选课管理控制器（薄层）
 */

import * as studentCourseService from '../services/studentCourseService.js';
import Response from '../utils/response.js';

export async function getMyCourses(req, res) {
  try {
    const result = await studentCourseService.getMyCourses(req.user.id);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.json(Response.success(result));
  } catch (err) {
    console.error('查询选课列表出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function getAvailableCourses(req, res) {
  try {
    const result = await studentCourseService.getAvailableCourses(req.user.id);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.json(Response.success(result));
  } catch (err) {
    console.error('查询可选课程出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function selectCourse(req, res) {
  try {
    const { course_schedule_id } = req.body;
    if (!course_schedule_id) {
      return res.status(400).json(Response.badRequest('请选择课程'));
    }
    const result = await studentCourseService.selectCourse(req.user.id, course_schedule_id);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.status(201).json(Response.created(result, '选课成功'));
  } catch (err) {
    console.error('选课出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function dropCourse(req, res) {
  try {
    const result = await studentCourseService.dropCourse(req.user.id, req.params.id);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.json(Response.success(null, '退选成功'));
  } catch (err) {
    console.error('退选课程出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function getSchedule(req, res) {
  try {
    const result = await studentCourseService.getSchedule(req.user.id);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.json(Response.success(result));
  } catch (err) {
    console.error('查询课表出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function autoAssignRequiredCourses(req, res) {
  try {
    const { course_schedule_id } = req.body;
    if (!course_schedule_id) {
      return res.status(400).json(Response.badRequest('请指定排课'));
    }
    const result = await studentCourseService.autoAssignRequiredCourses(course_schedule_id);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.json(Response.success({ assignedCount: result.assignedCount }, `成功为 ${result.assignedCount} 名学生分配课程`));
  } catch (err) {
    console.error('必修课自动分配出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function getStudentCoursesBySchedule(req, res) {
  try {
    const { scheduleId } = req.params;
    const result = await studentCourseService.getStudentCoursesBySchedule(scheduleId);
    return res.json(Response.success(result));
  } catch (err) {
    console.error('查询选课记录出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}
