/**
 * 成绩管理服务层
 * 成绩录入、查询、统计
 */

import pool from '../config/database.js';
import * as logger from '../logger/index.js';

/**
 * 查询成绩列表
 */
export async function getScores(query) {
  const { course_schedule_id, class_id, student_id } = query;
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (course_schedule_id) {
    conditions.push(`sc.course_schedule_id = $${paramIndex++}`);
    params.push(course_schedule_id);
  }
  if (class_id) {
    conditions.push(`s.class_id = $${paramIndex++}`);
    params.push(class_id);
  }
  if (student_id) {
    conditions.push(`sc.student_id = $${paramIndex++}`);
    params.push(student_id);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT g.id, g.score, g.exam_type, g.exam_date, g.remarks,
            s.student_no, s.name as student_name,
            co.name as course_name, co.code as course_code,
            c.name as class_name
     FROM scores g
     JOIN student_courses sc ON g.student_course_id = sc.id
     JOIN students s ON sc.student_id = s.id
     JOIN course_schedules cs ON sc.course_schedule_id = cs.id
     JOIN courses co ON cs.course_id = co.id
     JOIN classes c ON cs.class_id = c.id
     ${whereClause}
     ORDER BY s.student_no ASC`,
    params
  );

  return result.rows;
}

/**
 * 批量录入成绩（教师身份校验在 controller 中处理）
 */
export async function batchSaveScores(scores) {
  let savedCount = 0;
  for (const item of scores) {
    if (!item.student_course_id || item.score === undefined) continue;

    await pool.query(
      `INSERT INTO scores (student_course_id, score, exam_type, exam_date, remarks)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (student_course_id, exam_type)
       DO UPDATE SET score = $2, exam_date = $4, remarks = $5, updated_at = NOW()`,
      [item.student_course_id, item.score, item.exam_type || 'final', item.exam_date || null, item.remarks || null]
    );
    savedCount++;
  }

  logger.info(`批量录入成绩: ${savedCount} 条`);
  return { savedCount };
}

/**
 * 校验教师是否有权操作这些成绩
 */
export async function verifyTeacherScores(userId, studentCourseIds) {
  const teacherRes = await pool.query('SELECT id FROM teachers WHERE user_id = $1', [userId]);
  if (teacherRes.rows.length === 0) {
    return { _error: '未找到教师信息', _status: 403 };
  }
  const teacherId = teacherRes.rows[0].id;

  if (studentCourseIds.length > 0) {
    const unauthorized = await pool.query(
      `SELECT DISTINCT sc.id
       FROM student_courses sc
       JOIN course_schedules cs ON sc.course_schedule_id = cs.id
       WHERE sc.id = ANY($1) AND cs.teacher_id != $2
       LIMIT 1`,
      [studentCourseIds, teacherId]
    );
    if (unauthorized.rows.length > 0) {
      return { _error: '您只能录入自己所教课程的成绩', _status: 403 };
    }
  }

  return { teacherId };
}

/**
 * 查询某学生的所有成绩
 */
export async function getStudentScores(studentId) {
  const result = await pool.query(
    `SELECT g.score, g.exam_type, g.exam_date,
            co.name as course_name, co.code as course_code, co.credits,
            cs.semester, cs.academic_year,
            t.name as teacher_name
     FROM scores g
     JOIN student_courses sc ON g.student_course_id = sc.id
     JOIN course_schedules cs ON sc.course_schedule_id = cs.id
     JOIN courses co ON cs.course_id = co.id
     JOIN teachers t ON cs.teacher_id = t.id
     WHERE sc.student_id = $1
     ORDER BY cs.academic_year DESC, cs.semester DESC, co.name ASC`,
    [studentId]
  );

  return result.rows;
}

/**
 * 成绩统计
 */
export async function getScoreStatistics(courseScheduleId) {
  const summary = await pool.query(
    `SELECT
       co.name as course_name,
       COUNT(g.score) as total_count,
       ROUND(AVG(g.score)::numeric, 2) as avg_score,
       MAX(g.score) as max_score,
       MIN(g.score) as min_score,
       ROUND(COUNT(CASE WHEN g.score >= 60 THEN 1 END)::numeric / NULLIF(COUNT(g.score), 0) * 100, 2) as pass_rate
     FROM scores g
     JOIN student_courses sc ON g.student_course_id = sc.id
     JOIN course_schedules cs ON sc.course_schedule_id = cs.id
     JOIN courses co ON cs.course_id = co.id
     WHERE cs.id = $1 AND g.exam_type = 'final'
     GROUP BY co.name`,
    [courseScheduleId]
  );

  const distribution = await pool.query(
    `SELECT
       COUNT(CASE WHEN g.score >= 90 THEN 1 END) as excellent,
       COUNT(CASE WHEN g.score >= 80 AND g.score < 90 THEN 1 END) as good,
       COUNT(CASE WHEN g.score >= 70 AND g.score < 80 THEN 1 END) as medium,
       COUNT(CASE WHEN g.score >= 60 AND g.score < 70 THEN 1 END) as pass,
       COUNT(CASE WHEN g.score < 60 THEN 1 END) as fail
     FROM scores g
     JOIN student_courses sc ON g.student_course_id = sc.id
     WHERE sc.course_schedule_id = $1 AND g.exam_type = 'final'`,
    [courseScheduleId]
  );

  return {
    summary: summary.rows[0] || null,
    distribution: distribution.rows[0] || null,
  };
}
