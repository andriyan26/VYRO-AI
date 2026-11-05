import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';

dotenv.config();

import authRoutes from './modules/auth/auth.routes';
import videoRoutes from './modules/videos/videos.routes';
import commentRoutes from './modules/comments/comments.routes';
import aiRoutes from './modules/ai/ai.routes';
import userRoutes from './modules/users/users.routes';
import socialRoutes from './modules/social/social.routes';
import messageRoutes from './modules/messages/messages.routes';
import notificationRoutes from './modules/notifications/notifications.routes';
import creatorRoutes from './modules/creator/creator.routes';
import adminRoutes from './modules/admin/admin.routes';
import editorRoutes from './modules/editor/editor.routes';
import { setupSockets } from './sockets/socket';

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

setupSockets(io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Resolve uploads directory (supports root public_html/uploads OR ../../uploads)
const possibleUploadDirs = [
  path.join(__dirname, '../../uploads'),
  path.join(__dirname, '../uploads'),
  path.join(process.cwd(), 'uploads'),
];
const uploadsPath = possibleUploadDirs.find((p) => fs.existsSync(p)) || path.join(__dirname, '../../uploads');
app.use('/uploads', express.static(uploadsPath));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    platform: 'VYRO AI — Create. Share. Connect. Experience.',
    timestamp: new Date().toISOString(),
  });
});

// Register API Modules
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/creator', creatorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/editor', editorRoutes);

// Serve frontend static build (supports root public_html OR client/dist)
const possibleClientDirs = [
  path.join(__dirname, '../../'),          // When index.html is directly in public_html
  path.join(__dirname, '../../client/dist'), // When in client/dist
  path.join(process.cwd(), 'client/dist'),
  process.cwd(),
];
const clientStaticDir = possibleClientDirs.find((p) => fs.existsSync(path.join(p, 'index.html'))) || path.join(__dirname, '../../client/dist');
app.use(express.static(clientStaticDir));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/socket.io')) {
    return next();
  }
  const indexPath = path.join(clientStaticDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  next();
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 VYRO AI Server is running smoothly on http://localhost:${PORT}`);
  console.log(`📁 Static files served from: ${uploadsPath}`);
});

