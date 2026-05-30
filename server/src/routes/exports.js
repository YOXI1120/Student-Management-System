/**
 * 数据导出路由
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { exportStudents, exportScores } from '../controllers/exportController.js';

const router = Router();

router.post('/students', authenticate, authorize('admin', 'teacher'), exportStudents);
router.post('/scores', authenticate, authorize('admin', 'teacher'), exportScores);

export default router;
