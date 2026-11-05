import { Router } from 'express';
import { getVideoComments, postComment, likeComment } from './comments.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.get('/:videoId', getVideoComments);
router.post('/:videoId', requireAuth, postComment);
router.post('/:commentId/like', requireAuth, likeComment);

export default router;

