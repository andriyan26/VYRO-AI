import { Router } from 'express';
import { getConversations, getMessages, sendMessage } from './messages.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.get('/conversations', requireAuth, getConversations);
router.get('/:conversationId', requireAuth, getMessages);
router.post('/send', requireAuth, sendMessage);

export default router;

