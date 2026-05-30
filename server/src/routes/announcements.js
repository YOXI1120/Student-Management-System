/**
 * 公告管理路由
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getAnnouncements,
  getLatestAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';

const router = Router();

router.get('/', getAnnouncements);
router.get('/latest', getLatestAnnouncements);

router.post('/', authenticate, authorize('admin'), createAnnouncement);
router.put('/:id', authenticate, authorize('admin'), updateAnnouncement);
router.delete('/:id', authenticate, authorize('admin'), deleteAnnouncement);

export default router;
