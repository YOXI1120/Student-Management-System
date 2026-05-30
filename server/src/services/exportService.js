/**
 * 数据导出服务层
 * 提供导出所需的数据查询
 */

import pool from '../config/database.js';

/**
 * 查询导出的学生名单数据
 */
export async function getExportStudentsData(params) {
  const { college_id, class_id, keyword, status } = params;
  const conditions = [];
  const queryParams = [];
  let paramIndex = 1;

  if (college_id) { conditions.push(`c.college_id = $${paramIndex++}`); queryParams.push(college_id); }
  if (class_id) { conditions.push(`s.class_id = $${paramIndex++}`); queryParams.push(class_id); }
  if (keyword) {
    conditions.push(`(s.name ILIKE $${paramIndex} OR s.student_no ILIKE $${paramIndex})`);
    paramIndex++;
    queryParams.push(`%${keyword}%`);
  }
  if (status) { conditions.push(`s.status = $${paramIndex++}`); queryParams.push(status); }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT s.student_no, s.name, s.gender, s.id_card, s.date_of_birth,
            s.phone, s.email, c.name as class_name, col.name as college_name, s.status
     FROM students s
     LEFT JOIN classes c ON s.class_id = c.id
     LEFT JOIN colleges col ON c.college_id = col.id
     ${whereClause}
     ORDER BY s.student_no ASC`,
    queryParams
  );

  return result.rows;
}

/**
 * 查询导出的成绩单数据
 */
export async function getExportScoresData(params) {
  const { course_schedule_id, class_id, exam_type } = params;
  const conditions = [];
  const queryParams = [];
  let paramIndex = 1;

  if (course_schedule_id) { conditions.push(`sc.course_schedule_id = $${paramIndex++}`); queryParams.push(course_schedule_id); }
  if (class_id) { conditions.push(`s.class_id = $${paramIndex++}`); queryParams.push(class_id); }
  if (exam_type) { conditions.push(`g.exam_type = $${paramIndex++}`); queryParams.push(exam_type); }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT s.student_no, s.name as student_name, c.name as class_name,
            co.name as course_name, g.score, g.exam_type, g.exam_date
     FROM scores g
     JOIN student_courses sc ON g.student_course_id = sc.id
     JOIN students s ON sc.student_id = s.id
     JOIN course_schedules cs ON sc.course_schedule_id = cs.id
     JOIN courses co ON cs.course_id = co.id
     JOIN classes c ON cs.class_id = c.id
     ${whereClause}
     ORDER BY s.student_no ASC`,
    queryParams
  );

  return result.rows;
}
