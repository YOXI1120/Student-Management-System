/**
 * 认证服务层
 * 用户登录、获取个人信息、修改密码
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

/**
 * 用户登录
 */
export async function login(username, password) {
  const userResult = await pool.query(
    'SELECT id, username, password_hash, role, status FROM users WHERE username = $1',
    [username]
  );

  if (userResult.rows.length === 0) {
    return { _error: '用户名或密码错误', _status: 401 };
  }

  const user = userResult.rows[0];

  if (user.status === 'disabled') {
    return { _error: '账号已被禁用，请联系管理员', _status: 403 };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    return { _error: '用户名或密码错误', _status: 401 };
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  return { token, role: user.role };
}

/**
 * 获取当前登录用户信息
 */
export async function getProfile(userId, role) {
  let profile = null;

  if (role === 'student') {
    const result = await pool.query(`
      SELECT s.*, c.name as class_name, col.name as college_name
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN colleges col ON c.college_id = col.id
      WHERE s.user_id = $1
    `, [userId]);
    profile = result.rows[0] || null;
  } else if (role === 'teacher') {
    const result = await pool.query(`
      SELECT t.*, col.name as college_name
      FROM teachers t
      LEFT JOIN colleges col ON t.college_id = col.id
      WHERE t.user_id = $1
    `, [userId]);
    profile = result.rows[0] || null;

    if (profile) {
      const headRes = await pool.query(
        'SELECT COUNT(*) as count FROM classes WHERE head_teacher_id = $1',
        [profile.id]
      );
      profile.is_head_teacher = parseInt(headRes.rows[0].count) > 0;
    }
  }

  return profile;
}

/**
 * 修改密码
 */
export async function changePassword(userId, oldPassword, newPassword) {
  const userResult = await pool.query(
    'SELECT password_hash FROM users WHERE id = $1',
    [userId]
  );

  const isOldPasswordValid = await bcrypt.compare(oldPassword, userResult.rows[0].password_hash);
  if (!isOldPasswordValid) {
    return { _error: '旧密码错误', _status: 400 };
  }

  const salt = await bcrypt.genSalt(10);
  const newHash = await bcrypt.hash(newPassword, salt);

  await pool.query(
    'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
    [newHash, userId]
  );

  return { success: true };
}
