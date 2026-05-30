/**
 * 排课管理服务层
 * 排课的增删改查，支持冲突检测
 */

import pool from '../config/database.js';
import * as logger from '../logger/index.js';

/**
 * 获取排课列表
 * 教师角色自动过滤为自己所教的课程
 */
export async function getSchedules(query, user) {
  const { class_id, teacher_id, semester, academic_year, college_id } = query;
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (user && user.role === 'teacher') {
    const teacherRes = await pool.query('SELECT id FROM teachers WHERE user_id = $1', [user.id]);
    if (teacherRes.rows.length > 0) {
      conditions.push(`cs.teacher_id = $${paramIndex++}`);
      params.push(teacherRes.rows[0].id);
    }
  } else if (teacher_id) {
    conditions.push(`cs.teacher_id = $${paramIndex++}`);
    params.push(teacher_id);
  }

  if (class_id) {
    conditions.push(`cs.class_id = $${paramIndex++}`);
    params.push(class_id);
  }
  if (semester) {
    conditions.push(`cs.semester = $${paramIndex++}`);
    params.push(semester);
  }
  if (academic_year) {
    conditions.push(`cs.academic_year = $${paramIndex++}`);
    params.push(academic_year);
  }
  if (college_id) {
    conditions.push(`co.college_id = $${paramIndex++}`);
    params.push(college_id);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT cs.*,
            co.name as course_name, co.code as course_code, co.course_type,
            t.name as teacher_name, t.college_id as teacher_college_id,
            c.name as class_name, col.name as college_name
     FROM course_schedules cs
     JOIN courses co ON cs.course_id = co.id
     JOIN teachers t ON cs.teacher_id = t.id
     JOIN classes c ON cs.class_id = c.id
     JOIN colleges col ON co.college_id = col.id
     ${whereClause}
     ORDER BY cs.academic_year DESC, cs.semester DESC, cs.day_of_week ASC, cs.start_period ASC`,
    params
  );

  return result.rows;
}

/**
 * 新增排课（含冲突检测）
 */
export async function createSchedule(data) {
  const { course_id, teacher_id, class_id, semester, academic_year, day_of_week, start_period, end_period, location } = data;

  // 冲突检测：教师时间冲突
  const teacherConflict = await pool.query(
    `SELECT cs.id, c.name as course_name
     FROM course_schedules cs
     JOIN courses c ON cs.course_id = c.id
     WHERE cs.teacher_id = $1
       AND cs.semester = $2
       AND cs.academic_year = $3
       AND cs.day_of_week = $4
       AND cs.start_period < $5
       AND cs.end_period > $6`,
    [teacher_id, semester, academic_year, day_of_week, end_period, start_period]
  );

  if (teacherConflict.rows.length > 0) {
    return { _error: `教师时间冲突：该时间段教师已有课程「${teacherConflict.rows[0].course_name}」`, _status: 400 };
  }

  // 冲突检测：班级时间冲突
  const classConflict = await pool.query(
    `SELECT cs.id, c.name as course_name
     FROM course_schedules cs
     JOIN courses c ON cs.course_id = c.id
     WHERE cs.class_id = $1
       AND cs.semester = $2
       AND cs.academic_year = $3
       AND cs.day_of_week = $4
       AND cs.start_period < $5
       AND cs.end_period > $6`,
    [class_id, semester, academic_year, day_of_week, end_period, start_period]
  );

  if (classConflict.rows.length > 0) {
    return { _error: `班级时间冲突：该时间段班级已有课程「${classConflict.rows[0].course_name}」`, _status: 400 };
  }

  const result = await pool.query(
    `INSERT INTO course_schedules (course_id, teacher_id, class_id, semester, academic_year, day_of_week, start_period, end_period, location)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [course_id, teacher_id, class_id, semester, academic_year, day_of_week, start_period, end_period, location || null]
  );

  logger.info(`新增排课: 课程=${result.rows[0].id}`);
  return result.rows[0];
}

/**
 * 删除排课
 */
export async function deleteSchedule(id) {
  const enrollCheck = await pool.query(
    'SELECT COUNT(*) as count FROM student_courses WHERE course_schedule_id = $1',
    [id]
  );
  if (parseInt(enrollCheck.rows[0].count) > 0) {
    return { _error: '已有学生选课，无法删除排课', _status: 400 };
  }

  const result = await pool.query('DELETE FROM course_schedules WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) {
    return { _error: '排课记录不存在', _status: 404 };
  }

  logger.info(`删除排课: ${id}`);
  return { deleted: true };
}

/**
 * 按班级查询排课
 */
export async function getSchedulesByClass(id) {
  const result = await pool.query(
    `SELECT cs.*,
            co.name as course_name, co.code as course_code, co.course_type, co.credits,
            t.name as teacher_name
     FROM course_schedules cs
     JOIN courses co ON cs.course_id = co.id
     JOIN teachers t ON cs.teacher_id = t.id
     WHERE cs.class_id = $1
     ORDER BY cs.day_of_week ASC, cs.start_period ASC`,
    [id]
  );

  return result.rows;
}
