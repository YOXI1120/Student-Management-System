/**
 * 认证控制器（薄层）
 */

import * as authService from '../services/authService.js';
import Response from '../utils/response.js';

export async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json(Response.badRequest('用户名和密码不能为空'));
    }
    const result = await authService.login(username, password);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.json(Response.success(result, '登录成功'));
  } catch (err) {
    console.error('登录出错:', err);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function getProfile(req, res) {
  try {
    const { id, role, username } = req.user;
    const profile = await authService.getProfile(id, role);
    return res.json(Response.success({
      ...profile,
      id,
      username,
      role,
    }));
  } catch (err) {
    console.error('获取个人信息出错:', err);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function changePassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json(Response.badRequest('旧密码和新密码不能为空'));
    }
    if (newPassword.length < 6) {
      return res.status(400).json(Response.badRequest('新密码长度不能少于6位'));
    }
    const result = await authService.changePassword(req.user.id, oldPassword, newPassword);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.json(Response.success(null, '密码修改成功'));
  } catch (err) {
    console.error('修改密码出错:', err);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}
