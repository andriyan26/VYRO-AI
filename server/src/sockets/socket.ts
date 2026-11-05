import { Server as SocketIOServer, Socket } from 'socket.io';

export const setupSockets = (io: SocketIOServer) => {
  io.on('connection', (socket: Socket) => {
    console.log('⚡ Socket connected:', socket.id);

    // User personal room for DM and notifications
    socket.on('join_user', (userId: string) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`User ${userId} joined personal room`);
      }
    });

    // Video room for live comments and reactions
    socket.on('join_video', (videoId: string) => {
      if (videoId) {
        socket.join(`video:${videoId}`);
      }
    });

    socket.on('leave_video', (videoId: string) => {
      if (videoId) {
        socket.leave(`video:${videoId}`);
      }
    });

    // Realtime comment broadcast
    socket.on('new_comment', (data: { videoId: string; comment: any }) => {
      io.to(`video:${data.videoId}`).emit('comment_received', data.comment);
    });

    // Realtime chat message broadcast
    socket.on('send_direct_message', (data: { recipientId: string; message: any }) => {
      io.to(`user:${data.recipientId}`).emit('message_received', data.message);
    });

    // Realtime notification broadcast
    socket.on('send_notification', (data: { recipientId: string; notification: any }) => {
      io.to(`user:${data.recipientId}`).emit('notification_received', data.notification);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
};

