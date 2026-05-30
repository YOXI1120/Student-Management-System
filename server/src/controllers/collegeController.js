/**
 * 学院管理控制器（薄层）
 */

import * as collegeService from '../services/collegeService.js';
import Response from '../utils/response.js';
import * as logger from '../logger/index.js';

export async function getColleges(req, res) {
  try {
    const result = await collegeService.getColleges();
    return res.json(Response.success(result, '查询成功'));
  } catch (err) {
    logger.error('查询学院列表出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function getCollegeById(req, res) {
  try {
    const result = await collegeService.getCollegeById(req.params.id);
    if (!result) return res.status(404).json(Response.notFound('学院不存在'));
    return res.json(Response.success(result));
  } catch (err) {
    logger.error('查询学院详情出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function createCollege(req, res) {
  try {
    const { name, code } = req.body;
    if (!name || !code) {
      return res.status(400).json(Response.badRequest('学院名称和代码不能为空'));
    }
    const result = await collegeService.createCollege(req.body);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.status(201).json(Response.created(result, '学院创建成功'));
  } catch (err) {
    logger.error('创建学院出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function updateCollege(req, res) {
  try {
    const result = await collegeService.updateCollege(req.params.id, req.body);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.json(Response.success(result, '修改成功'));
  } catch (err) {
    logger.error('修改学院出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function deleteCollege(req, res) {
  try {
    const result = await collegeService.deleteCollege(req.params.id);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.json(Response.success(null, '删除成功'));
  } catch (err) {
    logger.error('删除学院出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}
