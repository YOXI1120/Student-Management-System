/**
 * 学院管理路由
 * 仅管理员可操作
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getColleges,
  getCollegeById,
  createCollege,
  updateCollege,
  deleteCollege,
} from '../controllers/collegeController.js';

const router = Router();

// 学院列表和详情：管理员和教师可查看
router.get('/', authenticate, authorize('admin', 'teacher'), getColleges);
router.get('/:id', authenticate, authorize('admin', 'teacher'), getCollegeById);

// 增删改：仅管理员
router.post('/', authenticate, authorize('admin'), createCollege);
router.put('/:id', authenticate, authorize('admin'), updateCollege);
router.delete('/:id', authenticate, authorize('admin'), deleteCollege);

export default router;
