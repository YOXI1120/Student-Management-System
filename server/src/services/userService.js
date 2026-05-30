/**
 * 用户管理服务层
 * 系统用户的增删改查（仅管理员）
 */

import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

/**
 * 获取用户列表
 */
export async function getUsers(query) {
  const { page = 1, pageSize = 10, role, status, keyword } = query;
  const offset = (parseInt(page) - 1) * parseInt(pageSize);
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (role) {
    conditions.push(`role = $${paramIndex++}`);
    params.push(role);
  }
  if (status) {
    conditions.push(`status = $${paramIndex++}`);
    params.push(status);
  }
  if (keyword) {
    conditions.push(`(username ILIKE $${paramIndex})`);
    paramIndex++;
    params.push(`%${keyword}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM users ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count);

  const result = await pool.query(
    `SELECT id, username, role, status, created_at, updated_at
     FROM users
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    [...params, parseInt(pageSize), offset]
  );

  return { rows: result.rows, total, page: parseInt(page), pageSize: parseInt(pageSize) };
}

/**
 * 创建用户
 * 非管理员用户默认密码为 123456
 */
export async function createUser(data) {
  const { username, password, role } = data;

  const exist = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
  if (exist.rows.length > 0) {
    return { _error: '用户名已存在', _status: 400 };
  }

  const defaultPwd = role === 'admin' ? password : (password || '123456');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPwd, salt);

  const result = await pool.query(
    `INSERT INTO users (username, password_hash, role, status)
     VALUES ($1, $2, $3, 'active')
     RETURNING id, username, role, status, created_at`,
    [username, passwordHash, role || 'student']
  );

  console.log(`创建用户: ${username}, 角色: ${role}`);
  return result.rows[0];
}

/**
 * 修改用户
 */
export async function updateUser(id, data) {
  const { role, status, password } = data;

  const updates = [];
  const params = [];
  let paramIndex = 1;

  if (role) { updates.push(`role = $${paramIndex++}`); params.push(role); }
  if (status) { updates.push(`status = $${paramIndex++}`); params.push(status); }
  if (password) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    updates.push(`password_hash = $${paramIndex++}`);
    params.push(hash);
  }

  if (updates.length === 0) {
    return { _error: '没有需要修改的字段', _status: 400 };
  }

  updates.push('updated_at = NOW()');
  params.push(id);

  const result = await pool.query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, username, role, status`,
    params
  );

  if (result.rows.length === 0) {
    return { _error: '用户不存在', _status: 404 };
  }

  console.log(`更新用户: ${result.rows[0].username}`);
  return result.rows[0];
}

/**
 * 删除用户
 */
export async function deleteUser(id, currentUserId) {
  if (id === currentUserId) {
    return { _error: '不能删除自己', _status: 400 };
  }

  const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING username', [id]);
  if (result.rows.length === 0) {
    return { _error: '用户不存在', _status: 404 };
  }

  console.log(`删除用户: ${result.rows[0].username}`);
  return { deleted: true };
}
