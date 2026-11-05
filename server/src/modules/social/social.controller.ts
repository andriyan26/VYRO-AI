import { Request, Response } from 'express';
import prisma from '../../config/prisma';

export const getExploreData = async (_req: Request, res: Response) => {
  try {
    const [categories, popularCreators, trendingVideos, topHashtags] = await Promise.all([
      prisma.category.findMany(),
      prisma.user.findMany({
        where: { role: 'CREATOR' },
        select: {
          id: true,
          username: true,
          fullName: true,
          avatarUrl: true,
          bio: true,
          isVerified: true,
          _count: { select: { followers: true, videos: true } },
        },
        take: 6,
      }),
      prisma.video.findMany({
        where: { visibility: 'PUBLIC', status: 'PUBLISHED' },
        include: {
          user: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
        },
        orderBy: [{ viewsCount: 'desc' }, { likesCount: 'desc' }],
        take: 8,
      }),
      prisma.hashtag.findMany({
        include: { _count: { select: { videos: true } } },
        orderBy: { videos: { _count: 'desc' } },
        take: 10,
      }),
    ]);

    return res.json({
      success: true,
      data: {
        categories,
        popularCreators,
        trendingVideos,
        topHashtags: topHashtags.map((h) => ({ id: h.id, name: h.name, count: h._count.videos })),
      },
    });
  } catch (error) {
    console.error('getExploreData error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load explore data' });
  }
};

export const search = async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || '';
    if (!query.trim()) {
      return res.json({ success: true, data: { videos: [], users: [], hashtags: [] } });
    }

    const cleanQuery = query.trim().replace(/^#/, '');

    const [videos, users, hashtags] = await Promise.all([
      prisma.video.findMany({
        where: {
          OR: [
            { title: { contains: cleanQuery } },
            { description: { contains: cleanQuery } },
          ],
          visibility: 'PUBLIC',
          status: 'PUBLISHED',
        },
        include: {
          user: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
        },
        take: 12,
      }),
      prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: cleanQuery } },
            { fullName: { contains: cleanQuery } },
          ],
        },
        select: {
          id: true,
          username: true,
          fullName: true,
          avatarUrl: true,
          bio: true,
          isVerified: true,
          _count: { select: { followers: true, videos: true } },
        },
        take: 8,
      }),
      prisma.hashtag.findMany({
        where: { name: { contains: cleanQuery } },
        include: { _count: { select: { videos: true } } },
        take: 8,
      }),
    ]);

    return res.json({
      success: true,
      data: {
        videos,
        users,
        hashtags: hashtags.map((h) => ({ id: h.id, name: h.name, count: h._count.videos })),
      },
    });
  } catch (error) {
    console.error('search error:', error);
    return res.status(500).json({ success: false, message: 'Failed to perform search' });
  }
};

export const getSounds = async (_req: Request, res: Response) => {
  try {
    const sounds = await prisma.sound.findMany({
      include: { _count: { select: { videos: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: sounds });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch sound library' });
  }
};

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();
    return res.json({ success: true, data: categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

