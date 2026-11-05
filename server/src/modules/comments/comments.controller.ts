import { Request, Response } from 'express';
import prisma from '../../config/prisma';

export const getVideoComments = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { videoId, parentId: null },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, avatarUrl: true, isVerified: true, role: true },
        },
        aiCharacter: {
          select: { id: true, name: true, avatar: true, personality: true, badgeColor: true },
        },
        replies: {
          include: {
            user: {
              select: { id: true, username: true, fullName: true, avatarUrl: true, isVerified: true, role: true },
            },
            aiCharacter: {
              select: { id: true, name: true, avatar: true, personality: true, badgeColor: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error('getVideoComments error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch comments' });
  }
};

export const postComment = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const { content, parentId } = req.body;
    const userId = req.user!.userId;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty' });
    }

    const comment = await prisma.comment.create({
      data: {
        videoId,
        userId,
        content: content.trim(),
        parentId: parentId || null,
        isAi: false,
      },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, avatarUrl: true, isVerified: true, role: true },
        },
      },
    });

    // Increment video comments count
    await prisma.video.update({
      where: { id: videoId },
      data: { commentsCount: { increment: 1 } },
    });

    return res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error('postComment error:', error);
    return res.status(500).json({ success: false, message: 'Failed to post comment' });
  }
};

export const likeComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;

    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { likesCount: { increment: 1 } },
      select: { id: true, likesCount: true },
    });

    return res.json({
      success: true,
      likesCount: comment.likesCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to like comment' });
  }
};

