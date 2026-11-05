import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { exportVideo, uploadEditorMedia, uploadEditorSound, extractCurrentVideoSound, uploadEditorSticker } from './editor.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Storage for Video Track Media
const mediaStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../../../uploads/videos'));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'editor-video-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Storage for Sound Track (Can be MP3, WAV, or MP4/MOV to extract audio)
const soundStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../../../uploads/sounds'));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'editor-sound-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Storage for Custom Stickers / Overlay Images
const stickerStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../../../uploads/stickers'));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'sticker-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const uploadMedia = multer({
  storage: mediaStorage,
  limits: { fileSize: 300 * 1024 * 1024 },
});

const uploadSound = multer({
  storage: soundStorage,
  limits: { fileSize: 300 * 1024 * 1024 },
});

const uploadSticker = multer({
  storage: stickerStorage,
  limits: { fileSize: 30 * 1024 * 1024 },
});

router.post('/upload-media', requireAuth, requireRole([Role.CREATOR, Role.ADMIN]), uploadMedia.single('media'), uploadEditorMedia);
router.post('/upload-sound', requireAuth, requireRole([Role.CREATOR, Role.ADMIN]), uploadSound.single('sound'), uploadEditorSound);
router.post('/upload-sticker', requireAuth, requireRole([Role.CREATOR, Role.ADMIN]), uploadSticker.single('sticker'), uploadEditorSticker);
router.post('/extract-current-sound', requireAuth, requireRole([Role.CREATOR, Role.ADMIN]), extractCurrentVideoSound);
router.post('/export', requireAuth, requireRole([Role.CREATOR, Role.ADMIN]), exportVideo);

export default router;
