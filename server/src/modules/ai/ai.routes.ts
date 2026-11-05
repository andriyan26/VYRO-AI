import { Router } from 'express';
import {
  getAICharacters,
  getAISettings,
  updateAISetting,
  analyzeVideo,
  generateAIComment,
  generateCreatorAssistantSuggestions,
} from './ai.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.get('/characters', getAICharacters);
router.get('/settings', getAISettings);
router.put('/settings', requireAuth, requireRole([Role.ADMIN]), updateAISetting);
router.post('/analyze', requireAuth, analyzeVideo);
router.post('/comment', requireAuth, generateAIComment);
router.post('/assistant/suggestions', requireAuth, generateCreatorAssistantSuggestions);

export default router;

