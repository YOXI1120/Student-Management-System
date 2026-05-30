/**
 * 用户管理控制器（薄层）
 */

import * as userService from '../services/userService.js';
import Response from '../utils/response.js';

export async function getUsers(req, res) {
  try {
    const result = await userService.getUsers(req.query);
    return res.json(Response.paginate(result.rows, result.total, result.page, result.pageSize));
  } catch (err) {
    console.error('查询用户列表出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function createUser(req, res) {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json(Response.badRequest('用户名不能为空'));
    }
    const result = await userService.createUser(req.body);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.status(201).json(Response.created(result, '用户创建成功'));
  } catch (err) {
    console.error('创建用户出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function updateUser(req, res) {
  try {
    const result = await userService.updateUser(req.params.id, req.body);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.json(Response.success(result, '修改成功'));
  } catch (err) {
    console.error('修改用户出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function deleteUser(req, res) {
  try {
    const result = await userService.deleteUser(req.params.id, req.user.id);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.json(Response.success(null, '删除成功'));
  } catch (err) {
    console.error('删除用户出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}
