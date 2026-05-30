/**
 * 学院管理服务层
 * 学院信息的增删改查
 */

import pool from '../config/database.js';
import * as logger from '../logger/index.js';

/**
 * 获取学院列表
 */
export async function getColleges() {
  const result = await pool.query('SELECT * FROM colleges ORDER BY created_at DESC');
  return result.rows;
}

/**
 * 获取单个学院
 */
export async function getCollegeById(id) {
  const result = await pool.query('SELECT * FROM colleges WHERE id = $1', [id]);
  return result.rows[0] || null;
}

/**
 * 新增学院
 */
export async function createCollege(data) {
  const { name, code, dean, phone } = data;

  // 检查学院代码是否已存在
  const exist = await pool.query('SELECT id FROM colleges WHERE code = $1', [code]);
  if (exist.rows.length > 0) {
    return { _error: '学院代码已存在', _status: 400 };
  }

  const result = await pool.query(
    `INSERT INTO colleges (name, code, dean, phone)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, code, dean || null, phone || null]
  );

  logger.info(`新增学院: ${name} (${code})`);
  return result.rows[0];
}

/**
 * 修改学院
 */
export async function updateCollege(id, data) {
  const { name, code, dean, phone } = data;

  const exist = await pool.query('SELECT * FROM colleges WHERE id = $1', [id]);
  if (exist.rows.length === 0) {
    return { _error: '学院不存在', _status: 404 };
  }

  // 如果修改了代码，检查新代码是否与其他学院冲突
  if (code && code !== exist.rows[0].code) {
    const conflict = await pool.query('SELECT id FROM colleges WHERE code = $1 AND id != $2', [code, id]);
    if (conflict.rows.length > 0) {
      return { _error: '学院代码已被其他学院使用', _status: 400 };
    }
  }

  const result = await pool.query(
    `UPDATE colleges
     SET name = COALESCE($1, name),
         code = COALESCE($2, code),
         dean = COALESCE($3, dean),
         phone = COALESCE($4, phone),
         updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [name || null, code || null, dean || null, phone || null, id]
  );

  logger.info(`更新学院: ${result.rows[0].name}`);
  return result.rows[0];
}

/**
 * 删除学院
 */
export async function deleteCollege(id) {
  // 检查该学院下是否有班级
  const classCheck = await pool.query('SELECT COUNT(*) as count FROM classes WHERE college_id = $1', [id]);
  if (parseInt(classCheck.rows[0].count) > 0) {
    return { _error: '该学院下存在班级，无法删除', _status: 400 };
  }

  const result = await pool.query('DELETE FROM colleges WHERE id = $1 RETURNING *', [id]);
  if (result.rows.length === 0) {
    return { _error: '学院不存在', _status: 404 };
  }

  logger.info(`删除学院: ${result.rows[0].name}`);
  return { deleted: true };
}
