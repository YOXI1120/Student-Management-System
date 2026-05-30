/**
 * 成绩管理路由
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getScores,
  batchSaveScores,
  getStudentScores,
  getScoreStatistics,
} from '../controllers/scoreController.js';

const router = Router();

router.get('/', authenticate, authorize('admin', 'teacher', 'student'), getScores);
router.get('/student/:id', authenticate, authorize('admin', 'teacher', 'student'), getStudentScores);
router.get('/statistics', authenticate, authorize('admin', 'teacher'), getScoreStatistics);

router.post('/batch', authenticate, authorize('admin', 'teacher'), batchSaveScores);

export default router;
