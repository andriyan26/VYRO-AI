import { Router } from 'express';
import { getCreatorAnalytics, saveDraft, getDrafts } from './creator.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.get('/analytics', requireAuth, requireRole([Role.CREATOR, Role.ADMIN]), getCreatorAnalytics);
router.post('/drafts', requireAuth, saveDraft);
router.get('/drafts', requireAuth, getDrafts);

export default router;

