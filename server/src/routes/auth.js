/**
 * 认证路由
 * 登录、获取个人信息、修改密码
 */

import { Router } from 'express';
import { login, getProfile, changePassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// 登录（不需要认证）
router.post('/login', login);

// 以下路由需要登录后才能访问
router.get('/profile', authenticate, getProfile);
router.put('/password', authenticate, changePassword);

export default router;
