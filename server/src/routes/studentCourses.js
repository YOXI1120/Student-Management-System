/**
 * 选课管理路由
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getMyCourses,
  getAvailableCourses,
  selectCourse,
  dropCourse,
  getSchedule,
  autoAssignRequiredCourses,
  getStudentCoursesBySchedule,
} from '../controllers/studentCourseController.js';

const router = Router();

// 学生端
router.get('/', authenticate, authorize('student'), getMyCourses);
router.get('/available', authenticate, authorize('student'), getAvailableCourses);
router.post('/select', authenticate, authorize('student'), selectCourse);
router.delete('/:id/drop', authenticate, authorize('student'), dropCourse);
router.get('/schedule', authenticate, authorize('student'), getSchedule);

// 管理员/教师端：根据排课获取选课记录（用于成绩录入）
router.get('/by-schedule/:scheduleId', authenticate, authorize('admin', 'teacher'), getStudentCoursesBySchedule);

// 管理员/教师端：必修课自动分配
router.post('/auto-assign', authenticate, authorize('admin', 'teacher'), autoAssignRequiredCourses);

export default router;
