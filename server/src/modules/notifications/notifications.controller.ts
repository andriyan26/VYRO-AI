import { Request, Response } from 'express';
import prisma from '../../config/prisma';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      include: {
        actor: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return res.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    if (id === 'all') {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
    } else {
      await prisma.notification.updateMany({
        where: { id, userId },
        data: { isRead: true },
      });
    }

    return res.json({ success: true, message: 'Notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update notifications' });
  }
};

