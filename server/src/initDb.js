/**
 * 数据库初始化脚本
 * 创建所有表结构并插入初始数据
 * 运行方式: node src/initDb.js
 */

import 'dotenv/config';
import pkg from 'pg';
import bcrypt from 'bcryptjs';
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

const sql = `
-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 学院表
CREATE TABLE IF NOT EXISTS colleges (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    code        VARCHAR(20) UNIQUE NOT NULL,
    dean        VARCHAR(50),
    phone       VARCHAR(20),
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- 2. 用户表
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username        VARCHAR(50) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'student',
    status          VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- 3. 教师表
CREATE TABLE IF NOT EXISTS teachers (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    teacher_no  VARCHAR(20) UNIQUE NOT NULL,
    name        VARCHAR(50) NOT NULL,
    id_card     VARCHAR(18) UNIQUE NOT NULL,
    gender      VARCHAR(10),
    phone       VARCHAR(20),
    email       VARCHAR(100),
    college_id  UUID REFERENCES colleges(id) ON DELETE SET NULL,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- 4. 班级表
CREATE TABLE IF NOT EXISTS classes (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              VARCHAR(100) NOT NULL,
    grade             VARCHAR(20),
    college_id        UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    head_teacher_id   UUID REFERENCES teachers(id) ON DELETE SET NULL,
    created_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP DEFAULT NOW()
);

-- 5. 学生表
CREATE TABLE IF NOT EXISTS students (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    student_no      VARCHAR(8) UNIQUE NOT NULL,
    name            VARCHAR(50) NOT NULL,
    id_card         VARCHAR(18) UNIQUE NOT NULL,
    gender          VARCHAR(10),
    date_of_birth   DATE,
    phone           VARCHAR(20),
    email           VARCHAR(100),
    address         VARCHAR(255),
    enrollment_date DATE,
    class_id        UUID REFERENCES classes(id) ON DELETE SET NULL,
    status          VARCHAR(20) DEFAULT 'active',
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- 6. 课程表
CREATE TABLE IF NOT EXISTS courses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    code        VARCHAR(20) UNIQUE NOT NULL,
    credits     DECIMAL(3,1) NOT NULL DEFAULT 0,
    hours       INTEGER DEFAULT 0,
    course_type VARCHAR(20) NOT NULL DEFAULT 'required',
    college_id  UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    description TEXT,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- 7. 排课表
CREATE TABLE IF NOT EXISTS course_schedules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    teacher_id      UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    class_id        UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    semester        VARCHAR(20) NOT NULL,
    academic_year   VARCHAR(20) NOT NULL,
    day_of_week     INTEGER NOT NULL,
    start_period    INTEGER NOT NULL,
    end_period      INTEGER NOT NULL,
    location        VARCHAR(100),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- 8. 选课表
CREATE TABLE IF NOT EXISTS student_courses (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id          UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_schedule_id  UUID NOT NULL REFERENCES course_schedules(id) ON DELETE CASCADE,
    is_auto             BOOLEAN DEFAULT true,
    status              VARCHAR(20) DEFAULT 'enrolled',
    enrolled_at         TIMESTAMP DEFAULT NOW(),
    dropped_at          TIMESTAMP,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, course_schedule_id)
);

-- 9. 成绩表
CREATE TABLE IF NOT EXISTS scores (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_course_id   UUID NOT NULL REFERENCES student_courses(id) ON DELETE CASCADE,
    score               DECIMAL(5,2),
    exam_type           VARCHAR(20) DEFAULT 'final',
    exam_date           DATE,
    remarks             VARCHAR(255),
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_course_id, exam_type)
);

-- 10. 学籍变更记录表
CREATE TABLE IF NOT EXISTS student_status_logs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id    UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    from_status   VARCHAR(20),
    to_status     VARCHAR(20) NOT NULL,
    reason        VARCHAR(500),
    operator_id   UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at    TIMESTAMP DEFAULT NOW()
);

-- 11. 公告表
CREATE TABLE IF NOT EXISTS announcements (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title         VARCHAR(200) NOT NULL,
    content       TEXT NOT NULL,
    publisher_id  UUID REFERENCES users(id) ON DELETE SET NULL,
    is_published  BOOLEAN DEFAULT false,
    published_at  TIMESTAMP,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_student_no ON students(student_no);
CREATE INDEX IF NOT EXISTS idx_classes_college_id ON classes(college_id);
CREATE INDEX IF NOT EXISTS idx_courses_college_id ON courses(college_id);
CREATE INDEX IF NOT EXISTS idx_course_schedules_teacher ON course_schedules(teacher_id);
CREATE INDEX IF NOT EXISTS idx_course_schedules_class ON course_schedules(class_id);
CREATE INDEX IF NOT EXISTS idx_student_courses_student ON student_courses(student_id);
`;

async function initDatabase() {
  console.log('正在连接数据库...');
  const client = await pool.connect();

  try {
    console.log('正在创建数据库表...');

    // 按分号分割并执行每条语句
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (let i = 0; i < statements.length; i++) {
      try {
        await client.query(statements[i]);
      } catch (err) {
        // 忽略 "already exists" 等非关键错误
        const msg = err.message || '';
        if (msg.includes('already exists') || msg.includes('duplicate')) {
          continue;
        }
        console.warn(`  语句 ${i + 1} 警告: ${msg.substring(0, 80)}`);
      }
    }

    console.log('✓ 表结构创建完成');

    // 创建管理员账户（如果不存在）
    const adminCheck = await client.query("SELECT id FROM users WHERE username = 'admin'");
    if (adminCheck.rows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('admin123', salt);
      await client.query(
        "INSERT INTO users (username, password_hash, role) VALUES ('admin', $1, 'admin')",
        [hash]
      );
      console.log('✓ 已创建管理员账户 (用户名: admin, 密码: admin123)');
    } else {
      console.log('✓ 管理员账户已存在');
    }

    console.log('\n✅ 数据库初始化全部完成！');
  } catch (err) {
    console.error('❌ 初始化失败:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase();
