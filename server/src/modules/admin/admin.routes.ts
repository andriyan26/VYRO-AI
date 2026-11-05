import { Router } from 'express';
import { getSystemOverview, getUsers, updateUserRole, getModerationVideos, deleteVideoModeration } from './admin.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(requireAuth, requireRole([Role.ADMIN]));

router.get('/overview', getSystemOverview);
router.get('/users', getUsers);
router.put('/users/:userId', updateUserRole);
router.get('/videos', getModerationVideos);
router.delete('/videos/:videoId', deleteVideoModeration);

export default router;

