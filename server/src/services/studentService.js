/**
 * 学生管理服务层
 * 学生信息的增删改查、学籍状态变更
 */

import pool from '../config/database.js';
import { generateStudentNo } from '../utils/studentNo.js';

/**
 * 查询当前教师是否为某学生的班主任
 */
export async function isHeadTeacherOf(userId, studentId) {
  const result = await pool.query(
    `SELECT 1 FROM classes c
     JOIN students s ON s.class_id = c.id
     JOIN teachers t ON t.id = c.head_teacher_id
     WHERE t.user_id = $1 AND s.id = $2`,
    [userId, studentId]
  );
  return result.rows.length > 0;
}

/**
 * 获取学生列表（分页 + 筛选）
 */
export async function getStudents(query) {
  const {
    page = 1,
    pageSize = 10,
    college_id,
    class_id,
    keyword,
    status,
  } = query;

  const offset = (parseInt(page) - 1) * parseInt(pageSize);
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (college_id) {
    conditions.push(`c.college_id = $${paramIndex++}`);
    params.push(college_id);
  }
  if (class_id) {
    conditions.push(`s.class_id = $${paramIndex++}`);
    params.push(class_id);
  }
  if (keyword) {
    conditions.push(`(s.name ILIKE $${paramIndex} OR s.student_no ILIKE $${paramIndex})`);
    paramIndex++;
    params.push(`%${keyword}%`);
  }
  if (status) {
    conditions.push(`s.status = $${paramIndex++}`);
    params.push(status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM students s
     LEFT JOIN classes c ON s.class_id = c.id
     ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count);

  const result = await pool.query(
    `SELECT s.*, c.name as class_name, col.name as college_name
     FROM students s
     LEFT JOIN classes c ON s.class_id = c.id
     LEFT JOIN colleges col ON c.college_id = col.id
     ${whereClause}
     ORDER BY s.student_no ASC
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    [...params, parseInt(pageSize), offset]
  );

  return { rows: result.rows, total, page: parseInt(page), pageSize: parseInt(pageSize) };
}

/**
 * 获取学生详情
 */
export async function getStudentById(id) {
  const result = await pool.query(`
    SELECT s.*, c.name as class_name, col.name as college_name
    FROM students s
    LEFT JOIN classes c ON s.class_id = c.id
    LEFT JOIN colleges col ON c.college_id = col.id
    WHERE s.id = $1
  `, [id]);

  return result.rows[0] || null;
}

/**
 * 新增学生
 */
export async function createStudent(data) {
  const { name, id_card, gender, date_of_birth, phone, email, address, enrollment_date, class_id } = data;

  const cardCheck = await pool.query('SELECT id FROM students WHERE id_card = $1', [id_card]);
  if (cardCheck.rows.length > 0) {
    return { _error: '该身份证号已被使用', _status: 400 };
  }

  const year = enrollment_date ? new Date(enrollment_date).getFullYear() : new Date().getFullYear();
  const studentNo = await generateStudentNo(year);

  const result = await pool.query(
    `INSERT INTO students (student_no, name, id_card, gender, date_of_birth,
      phone, email, address, enrollment_date, class_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [studentNo, name, id_card, gender || null, date_of_birth || null,
     phone || null, email || null, address || null, enrollment_date || null, class_id || null]
  );

  console.log(`新增学生: ${name}, 学号: ${studentNo}`);
  return result.rows[0];
}

/**
 * 修改学生（管理员：完整更新；班主任：仅限联系方式）
 */
export async function updateStudent(id, data, user) {
  const exist = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
  if (exist.rows.length === 0) {
    return { _error: '学生不存在', _status: 404 };
  }

  const { name, id_card, gender, date_of_birth, phone, email, address, enrollment_date, class_id, status } = data;

  // 教师角色：班主任只能修改联系方式
  if (user && user.role === 'teacher') {
    const isHead = await isHeadTeacherOf(user.id, id);
    if (!isHead) {
      return { _error: '您不是该学生的班主任，无权编辑', _status: 403 };
    }
    const result = await pool.query(
      `UPDATE students
       SET phone = COALESCE($1, phone),
           email = COALESCE($2, email),
           address = COALESCE($3, address),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [phone || null, email || null, address || null, id]
    );
    console.log(`班主任更新学生信息: ${result.rows[0].name}`);
    return result.rows[0];
  }

  // 管理员更新：检查身份证冲突
  if (id_card && id_card !== exist.rows[0].id_card) {
    const cardCheck = await pool.query('SELECT id FROM students WHERE id_card = $1 AND id != $2', [id_card, id]);
    if (cardCheck.rows.length > 0) {
      return { _error: '该身份证号已被其他学生使用', _status: 400 };
    }
  }

  const result = await pool.query(
    `UPDATE students
     SET name = COALESCE($1, name),
         id_card = COALESCE($2, id_card),
         gender = COALESCE($3, gender),
         date_of_birth = COALESCE($4, date_of_birth),
         phone = COALESCE($5, phone),
         email = COALESCE($6, email),
         address = COALESCE($7, address),
         enrollment_date = COALESCE($8, enrollment_date),
         class_id = COALESCE($9, class_id),
         status = COALESCE($10, status),
         updated_at = NOW()
     WHERE id = $11
     RETURNING *`,
    [name || null, id_card || null, gender || null, date_of_birth || null,
     phone || null, email || null, address || null, enrollment_date || null,
     class_id || null, status || null, id]
  );

  console.log(`更新学生: ${result.rows[0].name}`);
  return result.rows[0];
}

/**
 * 删除学生
 */
export async function deleteStudent(id) {
  const courseCheck = await pool.query('SELECT COUNT(*) as count FROM student_courses WHERE student_id = $1', [id]);
  if (parseInt(courseCheck.rows[0].count) > 0) {
    return { _error: '该学生已有选课记录，无法删除', _status: 400 };
  }

  const result = await pool.query('DELETE FROM students WHERE id = $1 RETURNING name', [id]);
  if (result.rows.length === 0) {
    return { _error: '学生不存在', _status: 404 };
  }

  console.log(`删除学生: ${result.rows[0].name}`);
  return { deleted: true };
}

/**
 * 变更学生状态（学籍管理）
 */
export async function changeStudentStatus(id, data, user) {
  const { status, reason } = data;

  // 教师角色校验：必须是班主任才能操作
  if (user && user.role === 'teacher') {
    const isHead = await isHeadTeacherOf(user.id, id);
    if (!isHead) {
      return { _error: '您不是该学生的班主任，无权操作学籍', _status: 403 };
    }
  }

  const current = await pool.query('SELECT name, status FROM students WHERE id = $1', [id]);
  if (current.rows.length === 0) {
    return { _error: '学生不存在', _status: 404 };
  }

  const fromStatus = current.rows[0].status;
  const studentName = current.rows[0].name;

  await pool.query('UPDATE students SET status = $1, updated_at = NOW() WHERE id = $2', [status, id]);
  await pool.query(
    `INSERT INTO student_status_logs (student_id, from_status, to_status, reason, operator_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, fromStatus, status, reason || null, user.id]
  );

  console.log(`学籍变更: ${studentName} ${fromStatus} → ${status}, 原因: ${reason || '无'}`);
  return { success: true, message: `状态已变更为: ${status}` };
}

/**
 * 获取学籍变更记录
 */
export async function getStatusLogs(id, user) {
  const student = await pool.query('SELECT name FROM students WHERE id = $1', [id]);
  if (student.rows.length === 0) {
    return { _error: '学生不存在', _status: 404 };
  }

  // 教师角色校验
  if (user && user.role === 'teacher') {
    const isHead = await isHeadTeacherOf(user.id, id);
    if (!isHead) {
      return { _error: '您不是该学生的班主任，无权查看学籍记录', _status: 403 };
    }
  }

  const result = await pool.query(
    `SELECT l.*, u.username as operator_name
     FROM student_status_logs l
     LEFT JOIN users u ON l.operator_id = u.id
     WHERE l.student_id = $1
     ORDER BY l.created_at DESC`,
    [id]
  );

  return {
    student_name: student.rows[0].name,
    logs: result.rows,
  };
}
