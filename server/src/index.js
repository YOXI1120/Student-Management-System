/**
 * 应用入口文件
 * Express 服务器启动配置
 *
 * 包含：全局中间件、路由注册、错误处理、日志记录
 */

import 'dotenv/config';      // 优先加载 .env 环境变量
import express from 'express';
import cors from 'cors';

// ==================== 路由导入 ====================

import authRoutes from './routes/auth.js';
import collegeRoutes from './routes/colleges.js';
import classRoutes from './routes/classes.js';
import studentRoutes from './routes/students.js';
import teacherRoutes from './routes/teachers.js';
import courseRoutes from './routes/courses.js';
import scheduleRoutes from './routes/schedules.js';
import studentCourseRoutes from './routes/studentCourses.js';
import scoreRoutes from './routes/scores.js';
import userRoutes from './routes/users.js';
import announcementRoutes from './routes/announcements.js';
import exportRoutes from './routes/exports.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== 简易日志工具 ====================

/**
 * 带时间戳的日志输出
 * 统一日志格式，方便查看和调试
 */
function log(level, message, data = null) {
  const time = new Date().toLocaleString('zh-CN', { hour12: false });
  const prefix = `[${time}] [${level}]`;
  if (data) {
    console.log(`${prefix} ${message}`, data);
  } else {
    console.log(`${prefix} ${message}`);
  }
}

// ==================== 全局中间件 ====================

// 请求日志中间件：记录每个 HTTP 请求的方法、路径和耗时
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    log('HTTP', `${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// 跨域配置：允许前端开发服务器（Vite 默认端口 5173）访问
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'],
  credentials: true,                  // 允许携带 cookie
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 解析 JSON 请求体（限制大小防止恶意请求）
app.use(express.json({ limit: '10mb' }));

// 解析 URL 编码的表单数据
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== 路由注册 ====================

app.use('/api/auth', authRoutes);                 // 认证模块（登录/个人信息/修改密码）
app.use('/api/colleges', collegeRoutes);          // 学院管理
app.use('/api/classes', classRoutes);             // 班级管理
app.use('/api/students', studentRoutes);          // 学生管理
app.use('/api/teachers', teacherRoutes);          // 教师管理
app.use('/api/courses', courseRoutes);            // 课程管理
app.use('/api/schedules', scheduleRoutes);        // 排课管理
app.use('/api/student-courses', studentCourseRoutes); // 选课管理
app.use('/api/scores', scoreRoutes);              // 成绩管理
app.use('/api/users', userRoutes);                // 用户管理
app.use('/api/announcements', announcementRoutes); // 公告管理
app.use('/api/export', exportRoutes);             // 数据导出

// ==================== 健康检查接口 ====================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ==================== 404 处理 ====================

/**
 * 处理所有未匹配的路由
 * 必须放在所有路由注册之后
 */
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: `接口不存在: ${req.method} ${req.originalUrl}`,
  });
});

// ==================== 全局错误处理中间件 ====================

/**
 * 全局错误捕获
 * Express 要求错误处理中间件必须有 4 个参数 (err, req, res, next)
 * 防止未捕获的错误导致服务器崩溃
 */
app.use((err, req, res, next) => {
  log('ERROR', `未捕获的错误: ${err.message}`);
  console.error(err.stack); // 打印完整堆栈以便调试

  // 区分已知类型错误和未知错误
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ code: 400, message: '请求体格式错误（无效的 JSON）' });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ code: 400, message: '文件大小超出限制' });
  }

  // 数据库连接错误
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({ code: 503, message: '数据库连接失败，请稍后重试' });
  }

  // 默认：服务器内部错误
  res.status(500).json({
    code: 500,
    message: process.env.NODE_ENV === 'production'
      ? '服务器内部错误'
      : `服务器错误: ${err.message}`, // 开发环境下暴露错误信息方便调试
  });
});

// ==================== 启动服务器 ====================

app.listen(PORT, () => {
  log('INFO', '========================================');
  log('INFO', `  学生管理系统后端服务已启动`);
  log('INFO', `  地址: http://localhost:${PORT}`);
  log('INFO', `  环境: ${process.env.NODE_ENV || 'development'}`);
  log('INFO', '========================================');
});

// 处理进程级未捕获异常（兜底，防止整个进程崩溃）
process.on('uncaughtException', (err) => {
  log('FATAL', `未捕获的进程异常: ${err.message}`);
  console.error(err.stack);
  // 记录日志后优雅退出
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log('FATAL', `未处理的 Promise 拒绝: ${reason}`);
});
