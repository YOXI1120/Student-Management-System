-- =====================================================
-- 学生管理系统 数据库初始化脚本
-- 数据库：PostgreSQL (Supabase)
-- =====================================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. colleges（学院表）
-- =====================================================
CREATE TABLE IF NOT EXISTS colleges (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,            -- 学院名称
    code        VARCHAR(20) UNIQUE NOT NULL,       -- 学院代码
    dean        VARCHAR(50),                       -- 院长
    phone       VARCHAR(20),                       -- 联系电话
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. users（用户表）
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username        VARCHAR(50) UNIQUE NOT NULL,    -- 用户名
    password_hash   VARCHAR(255) NOT NULL,           -- 密码哈希
    role            VARCHAR(20) NOT NULL DEFAULT 'student', -- 角色: admin/teacher/student
    status          VARCHAR(20) NOT NULL DEFAULT 'active',  -- active/disabled
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. teachers（教师信息表）
-- =====================================================
CREATE TABLE IF NOT EXISTS teachers (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    teacher_no  VARCHAR(20) UNIQUE NOT NULL,       -- 教师编号
    name        VARCHAR(50) NOT NULL,              -- 姓名
    id_card     VARCHAR(18) UNIQUE NOT NULL,       -- 身份证号
    gender      VARCHAR(10),                       -- 性别
    phone       VARCHAR(20),                       -- 电话
    email       VARCHAR(100),                      -- 邮箱
    college_id  UUID REFERENCES colleges(id) ON DELETE SET NULL,  -- 所属学院
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 4. classes（班级表）
-- =====================================================
CREATE TABLE IF NOT EXISTS classes (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              VARCHAR(100) NOT NULL,        -- 班级名称
    grade             VARCHAR(20),                  -- 年级
    college_id        UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,  -- 所属学院
    head_teacher_id   UUID REFERENCES teachers(id) ON DELETE SET NULL,          -- 班主任
    created_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 5. students（学生信息表）
-- =====================================================
CREATE TABLE IF NOT EXISTS students (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    student_no      VARCHAR(8) UNIQUE NOT NULL,     -- 学号（8位数字）
    name            VARCHAR(50) NOT NULL,            -- 姓名
    id_card         VARCHAR(18) UNIQUE NOT NULL,     -- 身份证号
    gender          VARCHAR(10),                     -- 性别
    date_of_birth   DATE,                            -- 出生日期
    phone           VARCHAR(20),                     -- 电话
    email           VARCHAR(100),                    -- 邮箱
    address         VARCHAR(255),                    -- 住址
    enrollment_date DATE,                            -- 入学日期
    class_id        UUID REFERENCES classes(id) ON DELETE SET NULL,  -- 所属班级
    status          VARCHAR(20) DEFAULT 'active',    -- active/graduated/suspended/dropped
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 6. courses（课程表）
-- =====================================================
CREATE TABLE IF NOT EXISTS courses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,              -- 课程名称
    code        VARCHAR(20) UNIQUE NOT NULL,         -- 课程代码
    credits     DECIMAL(3,1) NOT NULL DEFAULT 0,     -- 学分
    hours       INTEGER DEFAULT 0,                   -- 学时
    course_type VARCHAR(20) NOT NULL DEFAULT 'required',  -- required(必修)/elective(选修)
    college_id  UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,  -- 开课学院
    description TEXT,                                -- 课程描述
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 7. course_schedules（排课表）
-- =====================================================
CREATE TABLE IF NOT EXISTS course_schedules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    teacher_id      UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    class_id        UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    semester        VARCHAR(20) NOT NULL,             -- spring/autumn
    academic_year   VARCHAR(20) NOT NULL,             -- 如: 2025-2026
    day_of_week     INTEGER NOT NULL,                 -- 1=周一 ~ 7=周日
    start_period    INTEGER NOT NULL,                 -- 开始节次 (1-12)
    end_period      INTEGER NOT NULL,                 -- 结束节次
    location        VARCHAR(100),                     -- 上课地点
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 8. student_courses（选课表）
-- =====================================================
CREATE TABLE IF NOT EXISTS student_courses (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id          UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_schedule_id  UUID NOT NULL REFERENCES course_schedules(id) ON DELETE CASCADE,
    is_auto             BOOLEAN DEFAULT true,        -- true=必修自动分配, false=选修自选
    status              VARCHAR(20) DEFAULT 'enrolled',  -- enrolled/dropped/completed
    enrolled_at         TIMESTAMP DEFAULT NOW(),
    dropped_at          TIMESTAMP,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, course_schedule_id)
);

-- =====================================================
-- 9. scores（成绩表）
-- =====================================================
CREATE TABLE IF NOT EXISTS scores (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_course_id   UUID NOT NULL REFERENCES student_courses(id) ON DELETE CASCADE,
    score               DECIMAL(5,2),                -- 成绩
    exam_type           VARCHAR(20) DEFAULT 'final',  -- regular/midterm/final/makeup
    exam_date           DATE,
    remarks             VARCHAR(255),
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_course_id, exam_type)
);

-- =====================================================
-- 10. student_status_logs（学籍变更记录表）
-- =====================================================
CREATE TABLE IF NOT EXISTS student_status_logs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id    UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    from_status   VARCHAR(20),
    to_status     VARCHAR(20) NOT NULL,
    reason        VARCHAR(500),
    operator_id   UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at    TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 11. announcements（公告表）
-- =====================================================
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

-- =====================================================
-- 索引（提升查询性能）
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_student_no ON students(student_no);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_teachers_college_id ON teachers(college_id);
CREATE INDEX IF NOT EXISTS idx_classes_college_id ON classes(college_id);
CREATE INDEX IF NOT EXISTS idx_courses_college_id ON courses(college_id);
CREATE INDEX IF NOT EXISTS idx_course_schedules_teacher ON course_schedules(teacher_id);
CREATE INDEX IF NOT EXISTS idx_course_schedules_class ON course_schedules(class_id);
CREATE INDEX IF NOT EXISTS idx_student_courses_student ON student_courses(student_id);
CREATE INDEX IF NOT EXISTS idx_scores_student_course ON scores(student_course_id);
CREATE INDEX IF NOT EXISTS idx_student_status_logs_student ON student_status_logs(student_id);

-- =====================================================
-- 插入初始数据（管理员账户）
-- =====================================================
-- 密码是 bcrypt 加密后的，明文为: admin123
INSERT INTO users (username, password_hash, role) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin');
