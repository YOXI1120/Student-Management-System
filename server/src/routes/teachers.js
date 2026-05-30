/**
 * 教师管理路由
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from '../controllers/teacherController.js';

const router = Router();

router.get('/', authenticate, authorize('admin', 'teacher'), getTeachers);
router.get('/:id', authenticate, authorize('admin', 'teacher'), getTeacherById);

router.post('/', authenticate, authorize('admin'), createTeacher);
router.put('/:id', authenticate, authorize('admin'), updateTeacher);
router.delete('/:id', authenticate, authorize('admin'), deleteTeacher);

export default router;
