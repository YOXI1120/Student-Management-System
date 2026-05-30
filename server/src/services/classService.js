/**
 * 班级管理服务层
 * 班级的增删改查，以及班级学生列表查询
 */

import pool from '../config/database.js';

/**
 * 获取班级列表（含学院名称）
 */
export async function getClasses(query) {
  const { college_id } = query;

  let sql = `
    SELECT c.*, col.name as college_name, t.name as head_teacher_name
    FROM classes c
    LEFT JOIN colleges col ON c.college_id = col.id
    LEFT JOIN teachers t ON c.head_teacher_id = t.id
  `;
  const params = [];

  if (college_id) {
    sql += ' WHERE c.college_id = $1';
    params.push(college_id);
  }

  sql += ' ORDER BY c.grade DESC, c.name ASC';

  const result = await pool.query(sql, params);
  return result.rows;
}

/**
 * 获取班级详情（含学生列表）
 */
export async function getClassById(id) {
  const classResult = await pool.query(`
    SELECT c.*, col.name as college_name, t.name as head_teacher_name
    FROM classes c
    LEFT JOIN colleges col ON c.college_id = col.id
    LEFT JOIN teachers t ON c.head_teacher_id = t.id
    WHERE c.id = $1
  `, [id]);

  if (classResult.rows.length === 0) {
    return { _error: '班级不存在', _status: 404 };
  }

  const studentResult = await pool.query(
    `SELECT id, student_no, name, gender, status
     FROM students
     WHERE class_id = $1
     ORDER BY student_no ASC`,
    [id]
  );

  return {
    ...classResult.rows[0],
    students: studentResult.rows,
  };
}

/**
 * 新增班级
 */
export async function createClass(data) {
  const { name, grade, college_id, head_teacher_id } = data;

  const result = await pool.query(
    `INSERT INTO classes (name, grade, college_id, head_teacher_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, grade || null, college_id, head_teacher_id || null]
  );

  console.log(`新增班级: ${name}`);
  return result.rows[0];
}

/**
 * 修改班级
 */
export async function updateClass(id, data) {
  const { name, grade, college_id, head_teacher_id } = data;

  const exist = await pool.query('SELECT * FROM classes WHERE id = $1', [id]);
  if (exist.rows.length === 0) {
    return { _error: '班级不存在', _status: 404 };
  }

  const result = await pool.query(
    `UPDATE classes
     SET name = COALESCE($1, name),
         grade = COALESCE($2, grade),
         college_id = COALESCE($3, college_id),
         head_teacher_id = COALESCE($4, head_teacher_id),
         updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [name || null, grade || null, college_id || null, head_teacher_id || null, id]
  );

  console.log(`更新班级: ${result.rows[0].name}`);
  return result.rows[0];
}

/**
 * 删除班级
 */
export async function deleteClass(id) {
  const studentCheck = await pool.query('SELECT COUNT(*) as count FROM students WHERE class_id = $1', [id]);
  if (parseInt(studentCheck.rows[0].count) > 0) {
    return { _error: '该班级下有学生，无法删除', _status: 400 };
  }

  const result = await pool.query('DELETE FROM classes WHERE id = $1 RETURNING name', [id]);
  if (result.rows.length === 0) {
    return { _error: '班级不存在', _status: 404 };
  }

  console.log(`删除班级: ${result.rows[0].name}`);
  return { deleted: true };
}
