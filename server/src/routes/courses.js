/**
 * 课程管理路由
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController.js';

const router = Router();

router.get('/', authenticate, authorize('admin', 'teacher'), getCourses);
router.post('/', authenticate, authorize('admin'), createCourse);
router.put('/:id', authenticate, authorize('admin'), updateCourse);
router.delete('/:id', authenticate, authorize('admin'), deleteCourse);

export default router;
