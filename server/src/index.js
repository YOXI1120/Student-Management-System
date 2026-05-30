/**
 * 应用入口文件
 * Express 服务器启动配置
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import * as logger from './logger/index.js';

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

// ==================== 全局中间件 ====================

// 请求日志（精简：每 5 秒聚合写入，不刷屏）
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(req.method, req.originalUrl, res.statusCode, duration);
  });
  next();
});

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== 路由注册 ====================

app.use('/api/auth', authRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/student-courses', studentCourseRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/users', userRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/export', exportRoutes);

// ==================== 健康检查 ====================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ==================== 404 处理 ====================

app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: `接口不存在: ${req.method} ${req.originalUrl}`,
  });
});

// ==================== 全局错误处理 ====================

app.use((err, req, res, next) => {
  logger.error('未捕获的错误', err);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ code: 400, message: '请求体格式错误（无效的 JSON）' });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ code: 400, message: '文件大小超出限制' });
  }
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({ code: 503, message: '数据库连接失败，请稍后重试' });
  }

  res.status(500).json({
    code: 500,
    message: process.env.NODE_ENV === 'production'
      ? '服务器内部错误'
      : `服务器错误: ${err.message}`,
  });
});

// ==================== 启动服务器 ====================

app.listen(PORT, () => {
  logger.startup('========================================');
  logger.startup(`  学生管理系统后端服务已启动`);
  logger.startup(`  地址: http://localhost:${PORT}`);
  logger.startup(`  环境: ${process.env.NODE_ENV || 'development'}`);
  logger.startup(`  日志: server/logs/`);
  logger.startup('========================================');
  logger.info(`服务启动完成，端口: ${PORT}`);
});

// 进程级异常处理
process.on('uncaughtException', (err) => {
  logger.error('未捕获的进程异常', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('未处理的 Promise 拒绝', reason);
});
