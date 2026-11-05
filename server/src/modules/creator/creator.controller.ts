import { Request, Response } from 'express';
import prisma from '../../config/prisma';

export const getCreatorAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const [videos, totalFollowers] = await Promise.all([
      prisma.video.findMany({
        where: { userId },
        include: {
          _count: { select: { likes: true, comments: true, bookmarks: true } },
          category: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.follow.count({ where: { followingId: userId } }),
    ]);

    const totalViews = videos.reduce((acc, v) => acc + v.viewsCount, 0);
    const totalLikes = videos.reduce((acc, v) => acc + (v._count.likes || v.likesCount), 0);
    const totalComments = videos.reduce((acc, v) => acc + (v._count.comments || v.commentsCount), 0);

    const engagementRate = totalViews > 0 ? (((totalLikes + totalComments) / totalViews) * 100).toFixed(1) : '0';

    return res.json({
      success: true,
      data: {
        totalViews,
        totalLikes,
        totalComments,
        totalFollowers,
        engagementRate: `${engagementRate}%`,
        videosCount: videos.length,
        recentVideos: videos.slice(0, 10),
      },
    });
  } catch (error) {
    console.error('getCreatorAnalytics error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch creator analytics' });
  }
};

export const saveDraft = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { title, editorState } = req.body;

    const draft = await prisma.videoDraft.create({
      data: {
        userId,
        title: title || 'Untitled Draft',
        editorState: typeof editorState === 'string' ? editorState : JSON.stringify(editorState),
      },
    });

    return res.json({ success: true, data: draft });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to save draft' });
  }
};

export const getDrafts = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const drafts = await prisma.videoDraft.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    return res.json({ success: true, data: drafts });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch drafts' });
  }
};

