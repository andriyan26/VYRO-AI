import { Router } from 'express';
import { register, login, me, forgotPassword, resetPassword, logout } from './auth.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

export default router;

