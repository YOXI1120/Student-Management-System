/**
 * 排课管理路由
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getSchedules,
  createSchedule,
  deleteSchedule,
  getSchedulesByClass,
} from '../controllers/scheduleController.js';

const router = Router();

router.get('/', authenticate, authorize('admin', 'teacher'), getSchedules);
router.get('/by-class/:id', authenticate, authorize('admin', 'teacher', 'student'), getSchedulesByClass);
router.post('/', authenticate, authorize('admin'), createSchedule);
router.delete('/:id', authenticate, authorize('admin'), deleteSchedule);

export default router;
