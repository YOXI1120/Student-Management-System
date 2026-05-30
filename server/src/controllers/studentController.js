/**
 * 学生管理控制器（薄层）
 */

import * as studentService from '../services/studentService.js';
import Response from '../utils/response.js';
import * as logger from '../logger/index.js';

export async function getStudents(req, res) {
  try {
    const result = await studentService.getStudents(req.query);
    return res.json(Response.paginate(result.rows, result.total, result.page, result.pageSize));
  } catch (err) {
    logger.error('查询学生列表出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function getStudentById(req, res) {
  try {
    const result = await studentService.getStudentById(req.params.id);
    if (!result) return res.status(404).json(Response.notFound('学生不存在'));
    return res.json(Response.success(result));
  } catch (err) {
    logger.error('查询学生详情出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function createStudent(req, res) {
  try {
    const { name, id_card } = req.body;
    if (!name || !id_card) {
      return res.status(400).json(Response.badRequest('姓名和身份证号不能为空'));
    }
    const result = await studentService.createStudent(req.body);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.status(201).json(Response.created(result, '学生创建成功'));
  } catch (err) {
    logger.error('创建学生出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function updateStudent(req, res) {
  try {
    const result = await studentService.updateStudent(req.params.id, req.body, req.user);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.json(Response.success(result, '修改成功'));
  } catch (err) {
    logger.error('修改学生出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function deleteStudent(req, res) {
  try {
    const result = await studentService.deleteStudent(req.params.id);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.json(Response.success(null, '删除成功'));
  } catch (err) {
    logger.error('删除学生出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function changeStudentStatus(req, res) {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json(Response.badRequest('目标状态不能为空'));
    }
    const result = await studentService.changeStudentStatus(req.params.id, req.body, req.user);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.json(Response.success(null, result.message));
  } catch (err) {
    logger.error('变更学生状态出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function getStatusLogs(req, res) {
  try {
    const result = await studentService.getStatusLogs(req.params.id, req.user);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.json(Response.success(result));
  } catch (err) {
    logger.error('查询学籍变更记录出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}
