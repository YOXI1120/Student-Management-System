/**
 * 选课管理服务层
 * 必修分配、选修选课、课表查询
 */

import pool from '../config/database.js';

/**
 * 冲突检测函数
 */
async function checkTimeConflict(studentId, newScheduleId) {
  const newSchedule = await pool.query(
    'SELECT day_of_week, start_period, end_period, semester, academic_year FROM course_schedules WHERE id = $1',
    [newScheduleId]
  );
  if (newSchedule.rows.length === 0) return '排课记录不存在';

  const { day_of_week, start_period, end_period, semester, academic_year } = newSchedule.rows[0];

  const conflict = await pool.query(
    `SELECT cs.id, co.name as course_name
     FROM student_courses sc
     JOIN course_schedules cs ON sc.course_schedule_id = cs.id
     JOIN courses co ON cs.course_id = co.id
     WHERE sc.student_id = $1
       AND sc.status = 'enrolled'
       AND cs.semester = $2
       AND cs.academic_year = $3
       AND cs.day_of_week = $4
       AND cs.start_period < $5
       AND cs.end_period > $6`,
    [studentId, semester, academic_year, day_of_week, end_period, start_period]
  );

  return conflict.rows.length > 0
    ? `时间冲突：与「${conflict.rows[0].course_name}」在同一时间段`
    : null;
}

/**
 * 获取当前学生的选课列表
 */
export async function getMyCourses(userId) {
  const student = await pool.query('SELECT id, class_id FROM students WHERE user_id = $1', [userId]);
  if (student.rows.length === 0) {
    return { _error: '未找到学生信息', _status: 404 };
  }

  const result = await pool.query(
    `SELECT sc.id, sc.is_auto, sc.status, sc.enrolled_at,
            cs.day_of_week, cs.start_period, cs.end_period, cs.semester, cs.academic_year,
            co.name as course_name, co.code as course_code, co.credits, co.course_type,
            t.name as teacher_name
     FROM student_courses sc
     JOIN course_schedules cs ON sc.course_schedule_id = cs.id
     JOIN courses co ON cs.course_id = co.id
     JOIN teachers t ON cs.teacher_id = t.id
     WHERE sc.student_id = $1 AND sc.status = 'enrolled'
     ORDER BY cs.academic_year DESC, cs.semester DESC, cs.day_of_week ASC`,
    [student.rows[0].id]
  );

  return result.rows;
}

/**
 * 学生查看可选选修课列表
 */
export async function getAvailableCourses(userId) {
  const student = await pool.query('SELECT id, class_id FROM students WHERE user_id = $1', [userId]);
  if (student.rows.length === 0) {
    return { _error: '未找到学生信息', _status: 404 };
  }

  const studentId = student.rows[0].id;
  const classId = student.rows[0].class_id;

  const result = await pool.query(
    `SELECT cs.*, co.name as course_name, co.code as course_code, co.credits,
            t.name as teacher_name
     FROM course_schedules cs
     JOIN courses co ON cs.course_id = co.id
     JOIN teachers t ON cs.teacher_id = t.id
     WHERE co.course_type = 'elective'
       AND cs.class_id = $1
       AND cs.id NOT IN (
         SELECT course_schedule_id FROM student_courses WHERE student_id = $2
       )
     ORDER BY co.name ASC`,
    [classId, studentId]
  );

  return result.rows;
}

/**
 * 学生选修选修课
 */
export async function selectCourse(userId, courseScheduleId) {
  const student = await pool.query('SELECT id FROM students WHERE user_id = $1', [userId]);
  if (student.rows.length === 0) {
    return { _error: '未找到学生信息', _status: 404 };
  }
  const studentId = student.rows[0].id;

  const schedule = await pool.query(
    `SELECT co.course_type FROM course_schedules cs
     JOIN courses co ON cs.course_id = co.id
     WHERE cs.id = $1`,
    [courseScheduleId]
  );
  if (schedule.rows.length === 0) {
    return { _error: '排课记录不存在', _status: 404 };
  }
  if (schedule.rows[0].course_type !== 'elective') {
    return { _error: '只能选择选修课', _status: 400 };
  }

  const enrolled = await pool.query(
    'SELECT id FROM student_courses WHERE student_id = $1 AND course_schedule_id = $2',
    [studentId, courseScheduleId]
  );
  if (enrolled.rows.length > 0) {
    return { _error: '已选择该课程', _status: 400 };
  }

  const conflict = await checkTimeConflict(studentId, courseScheduleId);
  if (conflict) {
    return { _error: conflict, _status: 400 };
  }

  const result = await pool.query(
    `INSERT INTO student_courses (student_id, course_schedule_id, is_auto, status)
     VALUES ($1, $2, false, 'enrolled')
     RETURNING *`,
    [studentId, courseScheduleId]
  );

  console.log(`学生选课: student=${studentId}, schedule=${courseScheduleId}`);
  return result.rows[0];
}

/**
 * 退选选修课
 */
export async function dropCourse(userId, id) {
  const student = await pool.query('SELECT id FROM students WHERE user_id = $1', [userId]);
  if (student.rows.length === 0) {
    return { _error: '未找到学生信息', _status: 404 };
  }

  const course = await pool.query(
    'SELECT is_auto FROM student_courses WHERE id = $1 AND student_id = $2 AND status = $3',
    [id, student.rows[0].id, 'enrolled']
  );
  if (course.rows.length === 0) {
    return { _error: '选课记录不存在', _status: 404 };
  }
  if (course.rows[0].is_auto) {
    return { _error: '必修课不能退选', _status: 400 };
  }

  await pool.query(
    `UPDATE student_courses SET status = 'dropped', dropped_at = NOW(), updated_at = NOW()
     WHERE id = $1`,
    [id]
  );

  console.log(`退选课程: ${id}`);
  return { success: true };
}

/**
 * 获取学生课表
 */
export async function getSchedule(userId) {
  const student = await pool.query('SELECT id, name FROM students WHERE user_id = $1', [userId]);
  if (student.rows.length === 0) {
    return { _error: '未找到学生信息', _status: 404 };
  }

  const result = await pool.query(
    `SELECT cs.day_of_week, cs.start_period, cs.end_period, cs.location,
            co.name as course_name, co.course_type, co.credits,
            t.name as teacher_name
     FROM student_courses sc
     JOIN course_schedules cs ON sc.course_schedule_id = cs.id
     JOIN courses co ON cs.course_id = co.id
     JOIN teachers t ON cs.teacher_id = t.id
     WHERE sc.student_id = $1 AND sc.status = 'enrolled'
     ORDER BY cs.day_of_week ASC, cs.start_period ASC`,
    [student.rows[0].id]
  );

  return {
    student_name: student.rows[0].name,
    schedule: result.rows,
  };
}

/**
 * 根据排课 ID 获取选课记录（用于成绩录入）
 */
export async function getStudentCoursesBySchedule(scheduleId) {
  const result = await pool.query(
    `SELECT sc.id as student_course_id, sc.student_id
     FROM student_courses sc
     WHERE sc.course_schedule_id = $1 AND sc.status = 'enrolled'`,
    [scheduleId]
  );
  return result.rows;
}

/**
 * 必修课自动分配
 */
export async function autoAssignRequiredCourses(courseScheduleId) {
  const schedule = await pool.query(
    `SELECT cs.*, co.course_type
     FROM course_schedules cs
     JOIN courses co ON cs.course_id = co.id
     WHERE cs.id = $1`,
    [courseScheduleId]
  );
  if (schedule.rows.length === 0) {
    return { _error: '排课不存在', _status: 404 };
  }
  if (schedule.rows[0].course_type !== 'required') {
    return { _error: '只能为必修课分配', _status: 400 };
  }

  const { class_id } = schedule.rows[0];

  const students = await pool.query(
    `SELECT id FROM students WHERE class_id = $1 AND status = 'active'`,
    [class_id]
  );

  if (students.rows.length === 0) {
    return { _error: '该班级没有在校学生', _status: 400 };
  }

  let assignedCount = 0;
  for (const student of students.rows) {
    const exist = await pool.query(
      'SELECT id FROM student_courses WHERE student_id = $1 AND course_schedule_id = $2',
      [student.id, courseScheduleId]
    );
    if (exist.rows.length === 0) {
      await pool.query(
        `INSERT INTO student_courses (student_id, course_schedule_id, is_auto, status) VALUES ($1, $2, true, 'enrolled')`,
        [student.id, courseScheduleId]
      );
      assignedCount++;
    }
  }

  console.log(`必修课自动分配: schedule=${courseScheduleId}, 分配=${assignedCount}人`);
  return { assignedCount };
}
