import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import path from 'path';
import fs from 'fs';
import { Visibility, VideoStatus } from '@prisma/client';

export const getFeed = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?.userId;
    const type = (req.query.type as string) || 'foryou';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const skip = (page - 1) * limit;

    let whereClause: any = {
      status: VideoStatus.PUBLISHED,
      visibility: Visibility.PUBLIC,
    };

    if (type === 'following' && currentUserId) {
      const following = await prisma.follow.findMany({
        where: { followerId: currentUserId },
        select: { followingId: true },
      });
      const followingIds = following.map((f) => f.followingId);
      whereClause = {
        ...whereClause,
        userId: { in: followingIds },
      };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (type === 'trending') {
      orderBy = [{ viewsCount: 'desc' }, { likesCount: 'desc' }];
    }

    const videos = await prisma.video.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
        sound: true,
        category: true,
        hashtags: {
          include: {
            hashtag: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            bookmarks: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    // Check user interaction states (isLiked, isBookmarked, isFollowing)
    let userLikes: string[] = [];
    let userBookmarks: string[] = [];
    let userFollows: string[] = [];

    if (currentUserId) {
      const videoIds = videos.map((v) => v.id);
      const creatorIds = videos.map((v) => v.user.id);

      const [likes, bookmarks, follows] = await Promise.all([
        prisma.videoLike.findMany({
          where: { userId: currentUserId, videoId: { in: videoIds } },
          select: { videoId: true },
        }),
        prisma.bookmark.findMany({
          where: { userId: currentUserId, videoId: { in: videoIds } },
          select: { videoId: true },
        }),
        prisma.follow.findMany({
          where: { followerId: currentUserId, followingId: { in: creatorIds } },
          select: { followingId: true },
        }),
      ]);

      userLikes = likes.map((l) => l.videoId);
      userBookmarks = bookmarks.map((b) => b.videoId);
      userFollows = follows.map((f) => f.followingId);
    }

    const formattedVideos = videos.map((v) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      videoUrl: v.videoUrl,
      thumbnailUrl: v.thumbnailUrl || 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600',
      duration: v.duration,
      viewsCount: v.viewsCount,
      likesCount: v._count.likes || v.likesCount,
      commentsCount: v._count.comments || v.commentsCount,
      bookmarksCount: v._count.bookmarks || v.bookmarksCount,
      sharesCount: v.sharesCount,
      createdAt: v.createdAt,
      creator: {
        ...v.user,
        isFollowing: userFollows.includes(v.user.id),
      },
      sound: v.sound,
      category: v.category,
      hashtags: v.hashtags.map((h) => h.hashtag.name),
      isLiked: userLikes.includes(v.id),
      isBookmarked: userBookmarks.includes(v.id),
    }));

    return res.json({
      success: true,
      data: formattedVideos,
      page,
      hasMore: videos.length === limit,
    });
  } catch (error) {
    console.error('getFeed error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve video feed.' });
  }
};

export const getVideoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.userId;

    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, avatarUrl: true, isVerified: true, bio: true },
        },
        sound: true,
        category: true,
        hashtags: { include: { hashtag: true } },
        aiAnalysis: true,
      },
    });

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found.' });
    }

    // Increment view count
    await prisma.video.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    let isLiked = false;
    let isBookmarked = false;
    let isFollowing = false;

    if (currentUserId) {
      const [like, bookmark, follow] = await Promise.all([
        prisma.videoLike.findUnique({ where: { videoId_userId: { videoId: id, userId: currentUserId } } }),
        prisma.bookmark.findUnique({ where: { videoId_userId: { videoId: id, userId: currentUserId } } }),
        prisma.follow.findUnique({ where: { followerId_followingId: { followerId: currentUserId, followingId: video.userId } } }),
      ]);
      isLiked = !!like;
      isBookmarked = !!bookmark;
      isFollowing = !!follow;
    }

    return res.json({
      success: true,
      data: {
        ...video,
        isLiked,
        isBookmarked,
        isFollowing,
        hashtags: video.hashtags.map((h) => h.hashtag.name),
      },
    });
  } catch (error) {
    console.error('getVideoById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to get video details.' });
  }
};

export const toggleLike = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const existingLike = await prisma.videoLike.findUnique({
      where: { videoId_userId: { videoId: id, userId } },
    });

    let isLiked = false;
    if (existingLike) {
      await prisma.videoLike.delete({ where: { id: existingLike.id } });
      await prisma.video.update({ where: { id }, data: { likesCount: { decrement: 1 } } });
      isLiked = false;
    } else {
      await prisma.videoLike.create({ data: { videoId: id, userId } });
      await prisma.video.update({ where: { id }, data: { likesCount: { increment: 1 } } });
      isLiked = true;

      // Create notification for video creator
      const video = await prisma.video.findUnique({ where: { id }, select: { userId: true, title: true } });
      if (video && video.userId !== userId) {
        await prisma.notification.create({
          data: {
            userId: video.userId,
            actorId: userId,
            type: 'LIKE',
            videoId: id,
            message: `liked your video: "${video.title.slice(0, 30)}..."`,
          },
        });
      }
    }

    const updatedVideo = await prisma.video.findUnique({ where: { id }, select: { likesCount: true } });

    return res.json({
      success: true,
      isLiked,
      likesCount: updatedVideo?.likesCount || 0,
    });
  } catch (error) {
    console.error('toggleLike error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update like status.' });
  }
};

export const toggleBookmark = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const existingBookmark = await prisma.bookmark.findUnique({
      where: { videoId_userId: { videoId: id, userId } },
    });

    let isBookmarked = false;
    if (existingBookmark) {
      await prisma.bookmark.delete({ where: { id: existingBookmark.id } });
      await prisma.video.update({ where: { id }, data: { bookmarksCount: { decrement: 1 } } });
      isBookmarked = false;
    } else {
      await prisma.bookmark.create({ data: { videoId: id, userId } });
      await prisma.video.update({ where: { id }, data: { bookmarksCount: { increment: 1 } } });
      isBookmarked = true;
    }

    const updatedVideo = await prisma.video.findUnique({ where: { id }, select: { bookmarksCount: true } });

    return res.json({
      success: true,
      isBookmarked,
      bookmarksCount: updatedVideo?.bookmarksCount || 0,
    });
  } catch (error) {
    console.error('toggleBookmark error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update bookmark status.' });
  }
};

export const uploadVideo = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No video file uploaded.' });
    }

    const { title, description, categoryId, soundId, hashtags, visibility } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Video title is required.' });
    }

    const videoUrl = `/uploads/videos/${file.filename}`;
    // Default placeholder thumbnail or captured thumbnail
    const thumbnailUrl = 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600';

    const video = await prisma.video.create({
      data: {
        title,
        description: description || '',
        videoUrl,
        thumbnailUrl,
        duration: 15.0,
        visibility: visibility || Visibility.PUBLIC,
        status: VideoStatus.PUBLISHED,
        userId,
        categoryId: categoryId || null,
        soundId: soundId || null,
      },
    });

    // Handle hashtags
    if (hashtags) {
      const tagList = Array.isArray(hashtags)
        ? hashtags
        : hashtags.split(',').map((t: string) => t.trim().replace(/^#/, ''));

      for (const tagName of tagList) {
        if (tagName.length > 0) {
          const tag = await prisma.hashtag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName },
          });
          await prisma.videoHashtag.create({
            data: { videoId: video.id, hashtagId: tag.id },
          }).catch(() => {});
        }
      }
    }

    // Trigger AI Analysis and AI Contextual Comments automatically!
    try {
      const activeAiCharacters = await prisma.aICharacter.findMany({ where: { isActive: true }, take: 3 });
      
      const aiAnalysis = await prisma.aIAnalysis.create({
        data: {
          videoId: video.id,
          detectedContext: `Visual content titled "${title}". Features vibrant lighting and dynamic framing.`,
          detectedMood: 'Creative & Engaging',
          suggestedTags: JSON.stringify(['#vyro', '#creator', '#trending']),
          generatedCaption: `${title} ✨ Created with VYRO AI`,
          qualityScore: 9.0,
        },
      });

      // Generate initial contextual AI comments
      const contextualComments = [
        `Keren banget konsep videonya! Visualnya tajem dan enak banget ditonton 🔥`,
        `Transisi sama audionya pas banget! Ditunggu konten berikutnya yaa ✨`,
        `Wah, ide kreatifnya dapet banget! Sangat inspiratif 🙌`,
      ];

      for (let i = 0; i < Math.min(activeAiCharacters.length, 3); i++) {
        const char = activeAiCharacters[i];
        await prisma.comment.create({
          data: {
            videoId: video.id,
            isAi: true,
            aiCharacterId: char.id,
            content: contextualComments[i] || `Keren banget! Sukses terus yaa! 🌟`,
            likesCount: Math.floor(Math.random() * 20) + 5,
          },
        });
      }
    } catch (aiErr) {
      console.warn('AI automatic generation warning:', aiErr);
    }

    return res.status(201).json({
      success: true,
      message: 'Video published successfully!',
      data: video,
    });
  } catch (error) {
    console.error('uploadVideo error:', error);
    return res.status(500).json({ success: false, message: 'Failed to upload video.' });
  }
};

export const deleteVideo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const video = await prisma.video.findUnique({ where: { id } });
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found.' });
    }

    if (video.userId !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Permission denied to delete this video.' });
    }

    await prisma.video.delete({ where: { id } });

    return res.json({ success: true, message: 'Video deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete video.' });
  }
};

