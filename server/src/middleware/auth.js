/**
 * 认证与授权中间件
 *
 * 提供两个中间件：
 *   1. authenticate - JWT 令牌验证，解析用户信息挂载到 req.user
 *   2. authorize    - 角色授权，检查当前用户是否有指定角色
 *
 * 使用示例：
 *   router.get('/students', authenticate, authorize('admin', 'teacher'), handler)
 */

import jwt from 'jsonwebtoken';
import Response from '../utils/response.js';

/**
 * JWT 认证中间件
 *
 * 流程：
 *   1. 从请求头中提取 Bearer token
 *   2. 用 JWT_SECRET 验证 token 的合法性
 *   3. 验证通过后将用户信息（id, username, role）挂到 req.user 上
 *   4. 验证失败返回 401 错误
 */
export function authenticate(req, res, next) {
  // 从 Authorization 请求头中提取 token
  // 格式：Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(Response.unauthorized());
  }

  const token = authHeader.split(' ')[1]; // 去掉 "Bearer " 前缀，只取 token

  try {
    // 验证 token，如果过期或签名不对会抛异常
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, role } — 后续中间件和控制器可用
    next();
  } catch (err) {
    return res.status(401).json(Response.unauthorized('Token 无效或已过期'));
  }
}

/**
 * 角色授权中间件（工厂函数）
 *
 * @param {...string} roles - 允许访问的角色列表，如 authorize('admin', 'teacher')
 * @returns {Function} Express 中间件
 *
 * 注意：必须在 authenticate 之后使用，因为需要 req.user 的信息
 */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(Response.unauthorized());
    }
    // 检查当前用户角色是否在允许的角色列表中
    if (!roles.includes(req.user.role)) {
      return res.status(403).json(Response.forbidden('无权执行此操作'));
    }
    next();
  };
}
