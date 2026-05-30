/**
 * 课程管理服务层
 * 课程的增删改查
 */

import pool from '../config/database.js';

/**
 * 获取课程列表
 */
export async function getCourses(query) {
  const { college_id, course_type, keyword } = query;
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (college_id) {
    conditions.push(`co.college_id = $${paramIndex++}`);
    params.push(college_id);
  }
  if (course_type) {
    conditions.push(`co.course_type = $${paramIndex++}`);
    params.push(course_type);
  }
  if (keyword) {
    conditions.push(`(co.name ILIKE $${paramIndex} OR co.code ILIKE $${paramIndex})`);
    paramIndex++;
    params.push(`%${keyword}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT co.*, col.name as college_name
     FROM courses co
     LEFT JOIN colleges col ON co.college_id = col.id
     ${whereClause}
     ORDER BY co.code ASC`,
    params
  );

  return result.rows;
}

/**
 * 新增课程
 */
export async function createCourse(data) {
  const { name, code, credits, hours, course_type, college_id, description } = data;

  const exist = await pool.query('SELECT id FROM courses WHERE code = $1', [code]);
  if (exist.rows.length > 0) {
    return { _error: '课程代码已存在', _status: 400 };
  }

  const result = await pool.query(
    `INSERT INTO courses (name, code, credits, hours, course_type, college_id, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [name, code, credits || 0, hours || 0, course_type || 'required', college_id, description || null]
  );

  console.log(`新增课程: ${name} (${code})`);
  return result.rows[0];
}

/**
 * 修改课程
 */
export async function updateCourse(id, data) {
  const fields = ['name', 'code', 'credits', 'hours', 'course_type', 'college_id', 'description'];
  const updates = [];
  const params = [];
  let paramIndex = 1;

  for (const field of fields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = $${paramIndex++}`);
      params.push(data[field]);
    }
  }

  if (updates.length === 0) {
    return { _error: '没有需要修改的字段', _status: 400 };
  }

  updates.push('updated_at = NOW()');
  params.push(id);

  const result = await pool.query(
    `UPDATE courses SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    params
  );

  if (result.rows.length === 0) {
    return { _error: '课程不存在', _status: 404 };
  }

  console.log(`更新课程: ${result.rows[0].name}`);
  return result.rows[0];
}

/**
 * 删除课程
 */
export async function deleteCourse(id) {
  const scheduleCheck = await pool.query('SELECT COUNT(*) as count FROM course_schedules WHERE course_id = $1', [id]);
  if (parseInt(scheduleCheck.rows[0].count) > 0) {
    return { _error: '该课程已有排课记录，无法删除', _status: 400 };
  }

  const result = await pool.query('DELETE FROM courses WHERE id = $1 RETURNING name', [id]);
  if (result.rows.length === 0) {
    return { _error: '课程不存在', _status: 404 };
  }

  console.log(`删除课程: ${result.rows[0].name}`);
  return { deleted: true };
}
