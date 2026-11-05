import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getFeed, getVideoById, toggleLike, toggleBookmark, uploadVideo, deleteVideo } from './videos.controller';
import { requireAuth, optionalAuth, requireRole } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../../../uploads/videos'));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'vyro-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only video files (MP4, MOV, WEBM, MKV) are allowed'));
    }
  },
});

router.get('/feed', optionalAuth, getFeed);
router.get('/:id', optionalAuth, getVideoById);
router.post('/:id/like', requireAuth, toggleLike);
router.post('/:id/bookmark', requireAuth, toggleBookmark);
router.post('/upload', requireAuth, requireRole([Role.CREATOR, Role.ADMIN]), upload.single('video'), uploadVideo);
router.delete('/:id', requireAuth, deleteVideo);

export default router;

