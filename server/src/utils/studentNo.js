/**
 * 学号生成器
 *
 * 学号规则：8 位数字
 *   - 前 4 位：入学年份（如 2024）
 *   - 后 4 位：从 0001 开始递增
 *
 * 例如：20240001, 20240002, 20240003 ...
 */

import pool from '../config/database.js';

/**
 * 生成新学号
 * @param {number} enrollmentYear - 入学年份，如 2024
 * @returns {Promise<string>} 生成的 8 位学号
 * @throws {Error} 当年学号用尽时抛出异常
 */
export async function generateStudentNo(enrollmentYear) {
  // 取前 4 位作为年份前缀
  const yearStr = String(enrollmentYear).slice(0, 4);

  // 查询该年份最大的学号（当年最后一个学生的学号）
  const result = await pool.query(
    `SELECT student_no FROM students
     WHERE student_no LIKE $1
     ORDER BY student_no DESC
     LIMIT 1`,
    [`${yearStr}%`]
  );

  // 计算新序号：如果没有已有记录则从 1 开始，否则续接
  let seq = 1;
  if (result.rows.length > 0) {
    const maxNo = result.rows[0].student_no;
    seq = parseInt(maxNo.slice(-4)) + 1; // 取后 4 位 +1
  }

  // 安全校验：每年最多 9999 名学生
  if (seq > 9999) {
    throw new Error('该年份学号已用尽');
  }

  // 拼接学号：年份 + 4 位序号（不足前面补 0）
  return `${yearStr}${String(seq).padStart(4, '0')}`;
}
