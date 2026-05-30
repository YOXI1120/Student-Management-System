/**
 * 教师管理控制器（薄层）
 */

import * as teacherService from '../services/teacherService.js';
import Response from '../utils/response.js';

export async function getTeachers(req, res) {
  try {
    const result = await teacherService.getTeachers(req.query);
    return res.json(Response.success(result, '查询成功'));
  } catch (err) {
    console.error('查询教师列表出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function getTeacherById(req, res) {
  try {
    const result = await teacherService.getTeacherById(req.params.id);
    if (!result) return res.status(404).json(Response.notFound('教师不存在'));
    return res.json(Response.success(result));
  } catch (err) {
    console.error('查询教师详情出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function createTeacher(req, res) {
  try {
    const { name, id_card } = req.body;
    if (!name || !id_card) {
      return res.status(400).json(Response.badRequest('姓名和身份证号不能为空'));
    }
    const result = await teacherService.createTeacher(req.body);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.status(201).json(Response.created(result, '教师创建成功'));
  } catch (err) {
    console.error('创建教师出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function updateTeacher(req, res) {
  try {
    const result = await teacherService.updateTeacher(req.params.id, req.body);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.json(Response.success(result, '修改成功'));
  } catch (err) {
    console.error('修改教师出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function deleteTeacher(req, res) {
  try {
    const result = await teacherService.deleteTeacher(req.params.id);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.json(Response.success(null, '删除成功'));
  } catch (err) {
    console.error('删除教师出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}
