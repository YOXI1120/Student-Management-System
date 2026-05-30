/**
 * 教师管理服务层
 * 教师信息的增删改查
 */

import pool from '../config/database.js';

/**
 * 获取教师列表
 */
export async function getTeachers(query) {
  const { college_id, keyword } = query;
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (college_id) {
    conditions.push(`t.college_id = $${paramIndex++}`);
    params.push(college_id);
  }
  if (keyword) {
    conditions.push(`(t.name ILIKE $${paramIndex} OR t.teacher_no ILIKE $${paramIndex})`);
    paramIndex++;
    params.push(`%${keyword}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT t.*, col.name as college_name
     FROM teachers t
     LEFT JOIN colleges col ON t.college_id = col.id
     ${whereClause}
     ORDER BY t.teacher_no ASC`,
    params
  );

  return result.rows;
}

/**
 * 获取单个教师
 */
export async function getTeacherById(id) {
  const result = await pool.query(`
    SELECT t.*, col.name as college_name
    FROM teachers t
    LEFT JOIN colleges col ON t.college_id = col.id
    WHERE t.id = $1
  `, [id]);

  return result.rows[0] || null;
}

/**
 * 新增教师
 */
export async function createTeacher(data) {
  const { name, id_card, gender, phone, email, college_id } = data;

  const cardCheck = await pool.query('SELECT id FROM teachers WHERE id_card = $1', [id_card]);
  if (cardCheck.rows.length > 0) {
    return { _error: '该身份证号已被使用', _status: 400 };
  }

  // 自动生成教师编号
  const year = new Date().getFullYear();
  const seqResult = await pool.query(
    `SELECT COUNT(*) as count FROM teachers WHERE teacher_no LIKE $1`,
    [`T${year}%`]
  );
  const seq = parseInt(seqResult.rows[0].count) + 1;
  const teacherNo = `T${year}${String(seq).padStart(4, '0')}`;

  const result = await pool.query(
    `INSERT INTO teachers (teacher_no, name, id_card, gender, phone, email, college_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [teacherNo, name, id_card, gender || null, phone || null, email || null, college_id || null]
  );

  console.log(`新增教师: ${name}, 编号: ${teacherNo}`);
  return result.rows[0];
}

/**
 * 修改教师
 */
export async function updateTeacher(id, data) {
  const { name, id_card, gender, phone, email, college_id } = data;

  const exist = await pool.query('SELECT * FROM teachers WHERE id = $1', [id]);
  if (exist.rows.length === 0) {
    return { _error: '教师不存在', _status: 404 };
  }

  if (id_card && id_card !== exist.rows[0].id_card) {
    const conflict = await pool.query('SELECT id FROM teachers WHERE id_card = $1 AND id != $2', [id_card, id]);
    if (conflict.rows.length > 0) {
      return { _error: '该身份证号已被其他教师使用', _status: 400 };
    }
  }

  const result = await pool.query(
    `UPDATE teachers
     SET name = COALESCE($1, name),
         id_card = COALESCE($2, id_card),
         gender = COALESCE($3, gender),
         phone = COALESCE($4, phone),
         email = COALESCE($5, email),
         college_id = COALESCE($6, college_id),
         updated_at = NOW()
     WHERE id = $7
     RETURNING *`,
    [name || null, id_card || null, gender || null, phone || null, email || null, college_id || null, id]
  );

  console.log(`更新教师: ${result.rows[0].name}`);
  return result.rows[0];
}

/**
 * 删除教师
 */
export async function deleteTeacher(id) {
  const classCheck = await pool.query('SELECT COUNT(*) as count FROM classes WHERE head_teacher_id = $1', [id]);
  if (parseInt(classCheck.rows[0].count) > 0) {
    return { _error: '该教师是班主任，请先更换班主任', _status: 400 };
  }

  const result = await pool.query('DELETE FROM teachers WHERE id = $1 RETURNING name', [id]);
  if (result.rows.length === 0) {
    return { _error: '教师不存在', _status: 404 };
  }

  console.log(`删除教师: ${result.rows[0].name}`);
  return { deleted: true };
}
