/**
 * 学生管理路由
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  changeStudentStatus,
  getStatusLogs,
} from '../controllers/studentController.js';

const router = Router();

router.get('/', authenticate, authorize('admin', 'teacher'), getStudents);
router.get('/:id', authenticate, authorize('admin', 'teacher'), getStudentById);

router.post('/', authenticate, authorize('admin'), createStudent);
router.put('/:id', authenticate, authorize('admin', 'teacher'), updateStudent);
router.delete('/:id', authenticate, authorize('admin'), deleteStudent);

// 学籍管理（班主任可操作本班学生）
router.get('/:id/status-logs', authenticate, authorize('admin', 'teacher'), getStatusLogs);
router.post('/:id/change-status', authenticate, authorize('admin', 'teacher'), changeStudentStatus);

export default router;
