/**
 * 课程管理控制器（薄层）
 */

import * as courseService from '../services/courseService.js';
import Response from '../utils/response.js';
import * as logger from '../logger/index.js';

export async function getCourses(req, res) {
  try {
    const result = await courseService.getCourses(req.query);
    return res.json(Response.success(result));
  } catch (err) {
    logger.error('查询课程列表出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function createCourse(req, res) {
  try {
    const { name, code } = req.body;
    if (!name || !code) {
      return res.status(400).json(Response.badRequest('课程名称和课程代码不能为空'));
    }
    const result = await courseService.createCourse(req.body);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.status(201).json(Response.created(result, '课程创建成功'));
  } catch (err) {
    logger.error('创建课程出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function updateCourse(req, res) {
  try {
    const result = await courseService.updateCourse(req.params.id, req.body);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.json(Response.success(result, '修改成功'));
  } catch (err) {
    logger.error('修改课程出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function deleteCourse(req, res) {
  try {
    const result = await courseService.deleteCourse(req.params.id);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.json(Response.success(null, '删除成功'));
  } catch (err) {
    logger.error('删除课程出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}
