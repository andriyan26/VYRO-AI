import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  getUserProfile,
  toggleFollow,
  updateProfile,
  uploadAvatar,
  getFollowers,
  getFollowing,
  getLikesReceived,
} from './users.controller';
import { requireAuth, optionalAuth } from '../../middleware/auth';

const router = Router();

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../../../uploads/avatars'));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const uploadAvatarFile = multer({
  storage: avatarStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WEBP, GIF) are allowed for avatar'));
    }
  },
});

router.put('/me', requireAuth, updateProfile);
router.post('/avatar', requireAuth, uploadAvatarFile.single('avatar'), uploadAvatar);
router.get('/:username', optionalAuth, getUserProfile);
router.get('/:username/followers', optionalAuth, getFollowers);
router.get('/:username/following', optionalAuth, getFollowing);
router.get('/:username/likes-received', getLikesReceived);
router.post('/:targetUserId/follow', requireAuth, toggleFollow);

export default router;

