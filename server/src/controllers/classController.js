/**
 * 班级管理控制器（薄层）
 */

import * as classService from '../services/classService.js';
import Response from '../utils/response.js';

export async function getClasses(req, res) {
  try {
    const result = await classService.getClasses(req.query);
    return res.json(Response.success(result, '查询成功'));
  } catch (err) {
    console.error('查询班级列表出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function getClassById(req, res) {
  try {
    const result = await classService.getClassById(req.params.id);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.json(Response.success(result));
  } catch (err) {
    console.error('查询班级详情出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function createClass(req, res) {
  try {
    const { name, college_id } = req.body;
    if (!name || !college_id) {
      return res.status(400).json(Response.badRequest('班级名称和所属学院不能为空'));
    }
    const result = await classService.createClass(req.body);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.status(201).json(Response.created(result, '班级创建成功'));
  } catch (err) {
    console.error('创建班级出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function updateClass(req, res) {
  try {
    const result = await classService.updateClass(req.params.id, req.body);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.json(Response.success(result, '修改成功'));
  } catch (err) {
    console.error('修改班级出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function deleteClass(req, res) {
  try {
    const result = await classService.deleteClass(req.params.id);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.json(Response.success(null, '删除成功'));
  } catch (err) {
    console.error('删除班级出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}
