/**
 * 数据库种子数据脚本
 * 生成学院、教师、班级、学生、课程、排课、选课、成绩、公告等测试数据
 * 运行方式: node src/seed.js
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
  max: 20,
});

// ============== 基础数据 ==============

const COLLEGES = [
  { name: '计算机科学与技术学院', code: 'CS', dean: '张建国', phone: '020-39366001' },
  { name: '数学与统计学院', code: 'MATH', dean: '李明辉', phone: '020-39366002' },
  { name: '物理与电子工程学院', code: 'PHY', dean: '王振华', phone: '020-39366003' },
  { name: '化学化工学院', code: 'CHEM', dean: '陈志强', phone: '020-39366004' },
  { name: '外国语学院', code: 'FL', dean: '刘雅琴', phone: '020-39366005' },
  { name: '经济与管理学院', code: 'ECON', dean: '赵德明', phone: '020-39366006' },
  { name: '法学院', code: 'LAW', dean: '周正平', phone: '020-39366007' },
  { name: '文学与新闻传播学院', code: 'LIT', dean: '吴文博', phone: '020-39366008' },
  { name: '机械工程学院', code: 'ME', dean: '郑铁军', phone: '020-39366009' },
  { name: '土木工程学院', code: 'CE', dean: '黄大伟', phone: '020-39366010' },
];

const COURSES_DATA = [
  // 计算机学院
  { name: '数据结构与算法', code: 'CS101', credits: 4, hours: 64, course_type: 'required', college_idx: 0 },
  { name: '操作系统原理', code: 'CS102', credits: 3, hours: 48, course_type: 'required', college_idx: 0 },
  { name: '人工智能导论', code: 'CS201', credits: 3, hours: 48, course_type: 'elective', college_idx: 0 },
  // 数学学院
  { name: '数学分析', code: 'MATH101', credits: 5, hours: 80, course_type: 'required', college_idx: 1 },
  { name: '高等代数', code: 'MATH102', credits: 4, hours: 64, course_type: 'required', college_idx: 1 },
  { name: '概率论与数理统计', code: 'MATH201', credits: 3, hours: 48, course_type: 'elective', college_idx: 1 },
  // 物理学院
  { name: '大学物理', code: 'PHY101', credits: 4, hours: 64, course_type: 'required', college_idx: 2 },
  { name: '量子力学', code: 'PHY201', credits: 3, hours: 48, course_type: 'elective', college_idx: 2 },
  { name: '电子电路基础', code: 'PHY102', credits: 3, hours: 48, course_type: 'required', college_idx: 2 },
  // 化工学院
  { name: '无机化学', code: 'CHEM101', credits: 4, hours: 64, course_type: 'required', college_idx: 3 },
  { name: '有机化学', code: 'CHEM102', credits: 4, hours: 64, course_type: 'required', college_idx: 3 },
  { name: '分析化学', code: 'CHEM201', credits: 3, hours: 48, course_type: 'elective', college_idx: 3 },
  // 外语学院
  { name: '综合英语', code: 'FL101', credits: 4, hours: 64, course_type: 'required', college_idx: 4 },
  { name: '英语语法', code: 'FL102', credits: 2, hours: 32, course_type: 'required', college_idx: 4 },
  { name: '日语入门', code: 'FL201', credits: 2, hours: 32, course_type: 'elective', college_idx: 4 },
  // 经管学院
  { name: '微观经济学', code: 'ECON101', credits: 3, hours: 48, course_type: 'required', college_idx: 5 },
  { name: '宏观经济学', code: 'ECON102', credits: 3, hours: 48, course_type: 'required', college_idx: 5 },
  { name: '会计学基础', code: 'ECON201', credits: 3, hours: 48, course_type: 'elective', college_idx: 5 },
  // 法学院
  { name: '法理学', code: 'LAW101', credits: 3, hours: 48, course_type: 'required', college_idx: 6 },
  { name: '宪法学', code: 'LAW102', credits: 3, hours: 48, course_type: 'required', college_idx: 6 },
  { name: '刑法学', code: 'LAW201', credits: 3, hours: 48, course_type: 'elective', college_idx: 6 },
  // 文学院
  { name: '中国古代文学', code: 'LIT101', credits: 3, hours: 48, course_type: 'required', college_idx: 7 },
  { name: '现代汉语', code: 'LIT102', credits: 3, hours: 48, course_type: 'required', college_idx: 7 },
  { name: '新闻采访与写作', code: 'LIT201', credits: 2, hours: 32, course_type: 'elective', college_idx: 7 },
  // 机械学院
  { name: '机械制图', code: 'ME101', credits: 3, hours: 48, course_type: 'required', college_idx: 8 },
  { name: '工程力学', code: 'ME102', credits: 4, hours: 64, course_type: 'required', college_idx: 8 },
  { name: 'CAD技术', code: 'ME201', credits: 2, hours: 32, course_type: 'elective', college_idx: 8 },
  // 土木学院
  { name: '土木工程概论', code: 'CE101', credits: 2, hours: 32, course_type: 'required', college_idx: 9 },
  { name: '材料力学', code: 'CE102', credits: 4, hours: 64, course_type: 'required', college_idx: 9 },
  { name: '工程测量', code: 'CE201', credits: 3, hours: 48, course_type: 'elective', college_idx: 9 },
];

// 百家姓
const SURNAMES = [
  '王', '李', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴',
  '徐', '孙', '马', '朱', '胡', '郭', '何', '高', '林', '罗',
  '郑', '梁', '谢', '宋', '唐', '韩', '曹', '许', '邓', '萧',
  '冯', '曾', '程', '蔡', '彭', '潘', '袁', '于', '董', '余',
  '苏', '叶', '吕', '魏', '蒋', '田', '杜', '丁', '沈', '姜',
];

const GIVEN_NAMES = [
  '伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋',
  '勇', '艳', '杰', '娟', '涛', '明', '超', '霞', '平', '刚',
  '文', '鑫', '慧', '宇', '琳', '浩', '辉', '鹏', '飞', '彬',
  '宁', '欣', '帆', '凯', '萌', '晨', '曦', '睿', '博', '瑞',
  '昊', '哲', '俊', '帅', '恒', '毅', '嘉', '怡', '瑶', '琪',
  '悦', '萱', '婷', '佳', '蕊', '雪', '蕾', '诗', '涵', '梦',
  '倩', '萍', '红', '玲', '云', '莲', '雨', '涛', '海', '峰',
];

// 生成随机姓名
function randomName() {
  const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
  const given = GIVEN_NAMES[Math.floor(Math.random() * GIVEN_NAMES.length)];
  // 偶尔生成双字名
  if (Math.random() < 0.3) {
    const given2 = GIVEN_NAMES[Math.floor(Math.random() * GIVEN_NAMES.length)];
    return surname + given + given2;
  }
  return surname + given;
}

// 生成身份证号（18位，仅用于测试）
function generateIdCard(birthDate, gender) {
  const birth = birthDate.replace(/-/g, '');
  const randomDigits = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const genderDigit = gender === '男' ? Math.floor(Math.random() * 5 + 1) : Math.floor(Math.random() * 5 + 6);
  const base = `440${birth}${randomDigits}${genderDigit}`;
  return base + 'X';  // 简化校验位
}

// 生成手机号
function generatePhone() {
  const prefixes = ['138', '139', '150', '151', '152', '186', '187', '188', '189'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return prefix + suffix;
}

// ============== 主流程 ==============

async function seed() {
  const client = await pool.connect();
  console.log('开始插入种子数据...\n');

  try {
    // ===== 0. 清空已有数据（按外键约束逆序）=====
    console.log('正在清空旧数据...');
    await client.query('TRUNCATE TABLE scores CASCADE');
    await client.query('TRUNCATE TABLE student_courses CASCADE');
    await client.query('TRUNCATE TABLE course_schedules CASCADE');
    await client.query('TRUNCATE TABLE student_status_logs CASCADE');
    await client.query('TRUNCATE TABLE announcements CASCADE');
    await client.query('DELETE FROM students');
    await client.query('DELETE FROM courses');
    await client.query('DELETE FROM classes');
    await client.query('DELETE FROM teachers');
    await client.query("DELETE FROM users WHERE role != 'admin'");
    await client.query('DELETE FROM colleges');
    console.log('✓ 旧数据已清空\n');

    // ===== 1. 插入学院 =====
    console.log('正在插入学院...');
    const collegeIds = [];
    for (const c of COLLEGES) {
      const res = await client.query(
        `INSERT INTO colleges (name, code, dean, phone) VALUES ($1, $2, $3, $4) RETURNING id`,
        [c.name, c.code, c.dean, c.phone]
      );
      collegeIds.push(res.rows[0].id);
    }
    console.log(`✓ 已插入 ${collegeIds.length} 个学院`);

    // ===== 2. 插入课程 =====
    console.log('正在插入课程...');
    const courseIds = [];
    for (const c of COURSES_DATA) {
      const res = await client.query(
        `INSERT INTO courses (name, code, credits, hours, course_type, college_id)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [c.name, c.code, c.credits, c.hours, c.course_type, collegeIds[c.college_idx]]
      );
      courseIds.push(res.rows[0].id);
    }
    console.log(`✓ 已插入 ${courseIds.length} 门课程`);

    // ===== 3. 插入教师 =====
    console.log('正在插入教师...');
    const defaultHash = await bcrypt.hash('123456', 6);  // 统一密码，低轮数加快速度
    const teacherIds = [];
    let teacherNoSeq = 1;

    for (let ci = 0; ci < collegeIds.length; ci++) {
      const teacherCount = ci === 0 ? 10 : 6;  // 计算机学院多几个
      for (let i = 0; i < teacherCount; i++) {
        const name = randomName();
        const gender = Math.random() < 0.6 ? '男' : '女';
        const birthYear = 1970 + Math.floor(Math.random() * 20);
        const birthMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const birthDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        const birthDate = `${birthYear}-${birthMonth}-${birthDay}`;
        const teacherNo = `T${String(teacherNoSeq).padStart(6, '0')}`;
        teacherNoSeq++;

        // 创建用户
        const userRes = await client.query(
          `INSERT INTO users (username, password_hash, role) VALUES ($1, $2, 'teacher') RETURNING id`,
          [teacherNo, defaultHash]
        );
        const userId = userRes.rows[0].id;

        // 创建教师
        const res = await client.query(
          `INSERT INTO teachers (user_id, teacher_no, name, id_card, gender, phone, email, college_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
          [userId, teacherNo, name, generateIdCard(birthDate, gender), gender,
           generatePhone(), `teacher${teacherNo}@gzhu.edu.cn`, collegeIds[ci]]
        );
        teacherIds.push(res.rows[0].id);
      }
    }
    console.log(`✓ 已插入 ${teacherIds.length} 个教师`);

    // ===== 4. 插入班级 =====
    console.log('正在插入班级...');
    const grades = ['2023', '2024', '2025'];
    const classIds = [];
    for (let ci = 0; ci < collegeIds.length; ci++) {
      const classCount = collegeIds.length === 0 ? 3 : 2;
      for (let g of grades) {
        for (let i = 1; i <= classCount; i++) {
          const collegeName = COLLEGES[ci].name.replace(/学院$/, '');
          const className = `${collegeName}${g}-${i}班`;
          const headTeacherIdx = Math.floor(Math.random() * teacherIds.length);
          const res = await client.query(
            `INSERT INTO classes (name, grade, college_id, head_teacher_id)
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [className, g, collegeIds[ci], teacherIds[headTeacherIdx]]
          );
          classIds.push({ id: res.rows[0].id, college_idx: ci, grade: g });
        }
      }
    }
    console.log(`✓ 已插入 ${classIds.length} 个班级`);

    // ===== 5. 插入学生 =====
    console.log('正在插入学生...');
    const studentIds = [];
    let studentNoCounter = {};

    // 按年级生成学号
    for (let si = 0; si < 200; si++) {
      const classInfo = classIds[si % classIds.length];
      const grade = classInfo.grade;
      if (!studentNoCounter[grade]) studentNoCounter[grade] = 1;
      const studentNo = `${grade}${String(studentNoCounter[grade]++).padStart(4, '0')}`;

      const name = randomName();
      const gender = Math.random() < 0.5 ? '男' : '女';
      const birthYear = parseInt(grade) - 18 + Math.floor(Math.random() * 2);
      const birthMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
      const birthDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
      const birthDate = `${birthYear}-${birthMonth}-${birthDay}`;
      const enrollmentDate = `${grade}-09-01`;

      // 创建用户
      const userRes = await client.query(
        `INSERT INTO users (username, password_hash, role) VALUES ($1, $2, 'student') RETURNING id`,
        [studentNo, defaultHash]
      );
      const userId = userRes.rows[0].id;

      // 创建学生
      const res = await client.query(
        `INSERT INTO students (user_id, student_no, name, id_card, gender, date_of_birth,
          phone, email, enrollment_date, class_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
        [userId, studentNo, name, generateIdCard(birthDate, gender), gender, birthDate,
         generatePhone(), `stu${studentNo}@gzhu.edu.cn`, enrollmentDate, classInfo.id]
      );
      studentIds.push({ id: res.rows[0].id, class_id: classInfo.id, grade });
    }
    console.log(`✓ 已插入 ${studentIds.length} 个学生`);

    // ===== 6. 插入排课 =====
    console.log('正在插入排课...');
    const scheduleIds = [];

    // 构建每个学院在 teacherIds 中的索引范围
    const TEACHER_COUNTS = [10, 6, 6, 6, 6, 6, 6, 6, 6, 6];
    const teacherRangeByCollege = [];
    let teacherIdx = 0;
    for (let ci = 0; ci < collegeIds.length; ci++) {
      const count = TEACHER_COUNTS[ci];
      teacherRangeByCollege.push({ start: teacherIdx, end: teacherIdx + count });
      teacherIdx += count;
    }

    for (let ci = 0; ci < collegeIds.length; ci++) {
      // 每个学院选 2 门必修 + 1 门选修
      const collegeCourses = courseIds.filter((_, idx) => COURSES_DATA[idx].college_idx === ci);
      const requiredCourses = collegeCourses.slice(0, 2);
      const electiveCourses = collegeCourses.slice(2, 3);

      const allCourseSchedules = [...requiredCourses, ...electiveCourses];

      // 找到该学院的班级
      const collegeClasses = classIds.filter(c => c.college_idx === ci);

      for (const cls of collegeClasses) {
        for (const courseId of allCourseSchedules) {
          // 正确获取同学院的教师列表
          const range = teacherRangeByCollege[ci];
          const collegeTeachers = teacherIds.slice(range.start, range.end);
          const teacherId = collegeTeachers[Math.floor(Math.random() * collegeTeachers.length)];
          if (!teacherId) continue;

          const semester = cls.grade === '2025' ? 'spring' : 'autumn';
          const dayOfWeek = Math.floor(Math.random() * 5) + 1;  // 周一到周五
          const startPeriod = Math.floor(Math.random() * 4) + 1;  // 第1-4节开始
          const endPeriod = startPeriod + 1 + Math.floor(Math.random() * 2);  // 持续2-3节

          const res = await client.query(
            `INSERT INTO course_schedules
              (course_id, teacher_id, class_id, semester, academic_year, day_of_week, start_period, end_period, location)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
            [courseId, teacherId, cls.id, semester, `${parseInt(cls.grade)}-${parseInt(cls.grade) + 1}`,
             dayOfWeek, startPeriod, endPeriod, `教学楼${Math.floor(Math.random() * 10) + 1}0${Math.floor(Math.random() * 5) + 1}室`]
          );
          scheduleIds.push({
            id: res.rows[0].id,
            class_id: cls.id,
            course_id: courseId,
            is_elective: COURSES_DATA.find(c => c.code === undefined)?.course_type === 'elective',
          });
        }
      }
    }
    console.log(`✓ 已插入 ${scheduleIds.length} 条排课`);

    // ===== 7. 选课（必修自动分配 + 部分选修）=====
    console.log('正在生成选课记录...');
    let scCount = 0;

    for (const stu of studentIds) {
      // 找该班级的排课
      const classSchedules = scheduleIds.filter(s => s.class_id === stu.class_id);

      for (const sch of classSchedules) {
        const courseData = COURSES_DATA.find((_, idx) => courseIds[idx] === sch.course_id);
        const isAuto = courseData?.course_type === 'required';

        try {
          await client.query(
            `INSERT INTO student_courses (student_id, course_schedule_id, is_auto, status)
             VALUES ($1, $2, $3, 'enrolled') ON CONFLICT DO NOTHING`,
            [stu.id, sch.id, isAuto]
          );
          scCount++;
        } catch (e) {
          // 跳过冲突
        }
      }
    }
    console.log(`✓ 已生成 ${scCount} 条选课记录`);

    // ===== 8. 生成成绩 =====
    console.log('正在生成成绩...');
    let scoreCount = 0;

    // 获取所有选课记录
    const scRes = await client.query(
      `SELECT sc.id, sc.student_id, cs.course_id
       FROM student_courses sc
       JOIN course_schedules cs ON sc.course_schedule_id = cs.id
       WHERE sc.status = 'enrolled'`
    );

    for (const sc of scRes.rows) {
      // 部分学生缺少某些成绩（留空）
      if (Math.random() < 0.05) continue;

      // 生成正态分布成绩，均值75，标准差12
      let score = Math.round(75 + (Math.random() + Math.random() + Math.random() - 1.5) * 12);
      score = Math.max(0, Math.min(100, score));

      const examType = Math.random() < 0.7 ? 'final' : 'midterm';
      const examDate = `2025-0${Math.floor(Math.random() * 2) + 1}-${Math.floor(Math.random() * 28) + 1}`;

      try {
        await client.query(
          `INSERT INTO scores (student_course_id, score, exam_type, exam_date)
           VALUES ($1, $2, $3, $4) ON CONFLICT (student_course_id, exam_type) DO UPDATE
           SET score = EXCLUDED.score`,
          [sc.id, score, examType, examDate]
        );
        scoreCount++;
      } catch (e) {
        // 跳过冲突
      }
    }
    console.log(`✓ 已生成 ${scoreCount} 条成绩记录`);

    // ===== 9. 插入公告 =====
    console.log('正在插入公告...');
    const announcements = [
      { title: '2025-2026学年第一学期选课通知', content: '各位同学：2025-2026学年第一学期选课将于2025年6月15日开始，请同学们提前规划好课程安排，按时完成选课。选修课采取先到先得的方式，选课期间可以退选。' },
      { title: '关于2025年暑期社会实践活动的安排', content: '各学院：根据学校统一部署，2025年暑期社会实践活动将于7月10日至8月20日进行。请各学院做好组织安排工作，确保活动安全有序开展。' },
      { title: '2024-2025学年第二学期期末考试安排', content: '各位监考老师和同学：2024-2025学年第二学期期末考试将于2025年1月8日至1月20日进行，请各位老师和同学提前做好考试准备。' },
    ];

    // 获取管理员ID
    const adminRes = await client.query("SELECT id FROM users WHERE username = 'admin'");
    const adminId = adminRes.rows[0]?.id;

    for (const a of announcements) {
      await client.query(
        `INSERT INTO announcements (title, content, publisher_id, is_published, published_at)
         VALUES ($1, $2, $3, true, NOW())`,
        [a.title, a.content, adminId]
      );
    }
    console.log(`✓ 已插入 ${announcements.length} 条公告`);

    console.log('\n✅ 种子数据全部插入完成！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  学院: ${collegeIds.length} 个`);
    console.log(`  教师: ${teacherIds.length} 个`);
    console.log(`  班级: ${classIds.length} 个`);
    console.log(`  学生: ${studentIds.length} 个`);
    console.log(`  课程: ${courseIds.length} 门`);
    console.log(`  排课: ${scheduleIds.length} 条`);
    console.log(`  成绩: ${scoreCount} 条`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('教师默认密码: 123456');
    console.log('学生默认密码: 123456');
    console.log('管理员: admin / admin123');

  } catch (err) {
    console.error('❌ 插入种子数据失败:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
