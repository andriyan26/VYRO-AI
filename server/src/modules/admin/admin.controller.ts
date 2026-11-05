import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { Role } from '@prisma/client';

export const getSystemOverview = async (_req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      totalCreators,
      totalVideos,
      totalComments,
      aiCommentsCount,
      categoriesCount,
      soundsCount,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: Role.CREATOR } }),
      prisma.video.count(),
      prisma.comment.count(),
      prisma.comment.count({ where: { isAi: true } }),
      prisma.category.count(),
      prisma.sound.count(),
      prisma.user.findMany({
        select: { id: true, username: true, fullName: true, email: true, role: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const totalViews = await prisma.video.aggregate({ _sum: { viewsCount: true } });

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalCreators,
        totalVideos,
        totalComments,
        aiCommentsCount,
        humanCommentsCount: totalComments - aiCommentsCount,
        totalViews: totalViews._sum.viewsCount || 0,
        categoriesCount,
        soundsCount,
        recentUsers,
      },
    });
  } catch (error) {
    console.error('getSystemOverview error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch admin overview' });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          username: true,
          fullName: true,
          email: true,
          role: true,
          avatarUrl: true,
          isVerified: true,
          createdAt: true,
          _count: { select: { videos: true, followers: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count(),
    ]);

    return res.json({ success: true, data: users, total, page });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { role, isVerified } = req.body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        role: role as Role,
        isVerified: isVerified !== undefined ? isVerified : undefined,
      },
      select: { id: true, username: true, role: true, isVerified: true },
    });

    return res.json({ success: true, data: updated, message: 'User updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update user' });
  }
};

export const getModerationVideos = async (req: Request, res: Response) => {
  try {
    const videos = await prisma.video.findMany({
      include: {
        user: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
        _count: { select: { comments: true, likes: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return res.json({ success: true, data: videos });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch videos for moderation' });
  }
};

export const deleteVideoModeration = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    await prisma.video.delete({ where: { id: videoId } });
    return res.json({ success: true, message: 'Video removed by moderator' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete video' });
  }
};

