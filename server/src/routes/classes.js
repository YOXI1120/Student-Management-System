/**
 * 班级管理路由
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
} from '../controllers/classController.js';

const router = Router();

router.get('/', authenticate, authorize('admin', 'teacher'), getClasses);
router.get('/:id', authenticate, authorize('admin', 'teacher'), getClassById);

router.post('/', authenticate, authorize('admin'), createClass);
router.put('/:id', authenticate, authorize('admin'), updateClass);
router.delete('/:id', authenticate, authorize('admin'), deleteClass);

export default router;
