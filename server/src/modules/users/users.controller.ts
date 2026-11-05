import { Request, Response } from 'express';
import prisma from '../../config/prisma';

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user?.userId;

    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        avatarUrl: true,
        bio: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            videos: true,
            likes: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if current user is following
    let isFollowing = false;
    if (currentUserId && currentUserId !== user.id) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: user.id,
          },
        },
      });
      isFollowing = !!follow;
    }

    // Get user's published videos
    const videos = await prisma.video.findMany({
      where: { userId: user.id, status: 'PUBLISHED' },
      select: {
        id: true,
        title: true,
        videoUrl: true,
        thumbnailUrl: true,
        viewsCount: true,
        likesCount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate total likes received across all videos
    const totalLikesReceived = await prisma.video.aggregate({
      where: { userId: user.id },
      _sum: { likesCount: true },
    });

    return res.json({
      success: true,
      data: {
        ...user,
        isFollowing,
        totalLikesReceived: totalLikesReceived._sum.likesCount || 0,
        videos,
      },
    });
  } catch (error) {
    console.error('getUserProfile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile' });
  }
};

export const toggleFollow = async (req: Request, res: Response) => {
  try {
    const { targetUserId } = req.params;
    const currentUserId = req.user!.userId;

    if (currentUserId === targetUserId) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    let isFollowing = false;
    if (existingFollow) {
      await prisma.follow.delete({ where: { id: existingFollow.id } });
      isFollowing = false;
    } else {
      await prisma.follow.create({
        data: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      });
      isFollowing = true;

      // Create notification
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          actorId: currentUserId,
          type: 'FOLLOW',
          message: 'started following you!',
        },
      });
    }

    const updatedFollowersCount = await prisma.follow.count({ where: { followingId: targetUserId } });

    return res.json({
      success: true,
      isFollowing,
      followersCount: updatedFollowersCount,
    });
  } catch (error) {
    console.error('toggleFollow error:', error);
    return res.status(500).json({ success: false, message: 'Failed to toggle follow status' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { fullName, bio, avatarUrl } = req.body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: fullName || undefined,
        bio: bio !== undefined ? bio : undefined,
        avatarUrl: avatarUrl || undefined,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        avatarUrl: true,
        bio: true,
      },
    });

    return res.json({ success: true, data: updated, message: 'Profile updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        avatarUrl: true,
        bio: true,
      },
    });

    return res.json({
      success: true,
      data: updated,
      avatarUrl,
      message: 'Avatar uploaded and updated successfully',
    });
  } catch (error) {
    console.error('uploadAvatar error:', error);
    return res.status(500).json({ success: false, message: 'Failed to upload avatar' });
  }
};

export const getFollowers = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user?.userId;

    const targetUser = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: { id: true },
    });

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const follows = await prisma.follow.findMany({
      where: { followingId: targetUser.id },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            bio: true,
            isVerified: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let currentUserFollowings: string[] = [];
    if (currentUserId) {
      const myFollows = await prisma.follow.findMany({
        where: { followerId: currentUserId },
        select: { followingId: true },
      });
      currentUserFollowings = myFollows.map((f) => f.followingId);
    }

    const followers = follows.map((f) => ({
      ...f.follower,
      isFollowing: currentUserFollowings.includes(f.follower.id),
      isSelf: currentUserId === f.follower.id,
    }));

    return res.json({ success: true, data: followers });
  } catch (error) {
    console.error('getFollowers error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch followers' });
  }
};

export const getFollowing = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user?.userId;

    const targetUser = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: { id: true },
    });

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const follows = await prisma.follow.findMany({
      where: { followerId: targetUser.id },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            bio: true,
            isVerified: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let currentUserFollowings: string[] = [];
    if (currentUserId) {
      const myFollows = await prisma.follow.findMany({
        where: { followerId: currentUserId },
        select: { followingId: true },
      });
      currentUserFollowings = myFollows.map((f) => f.followingId);
    }

    const following = follows.map((f) => ({
      ...f.following,
      isFollowing: currentUserFollowings.includes(f.following.id),
      isSelf: currentUserId === f.following.id,
    }));

    return res.json({ success: true, data: following });
  } catch (error) {
    console.error('getFollowing error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch following accounts' });
  }
};

export const getLikesReceived = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    const targetUser = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: { id: true },
    });

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const videos = await prisma.video.findMany({
      where: { userId: targetUser.id, status: 'PUBLISHED' },
      select: {
        id: true,
        title: true,
        thumbnailUrl: true,
        videoUrl: true,
        likesCount: true,
        viewsCount: true,
        createdAt: true,
      },
      orderBy: { likesCount: 'desc' },
    });

    // Also get the users who liked the targetUser's videos
    const recentLikes = await prisma.videoLike.findMany({
      where: {
        video: { userId: targetUser.id },
      },
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
        video: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 40,
    });

    const totalLikes = videos.reduce((acc, v) => acc + (v.likesCount || 0), 0);

    return res.json({
      success: true,
      data: {
        totalLikes,
        videos,
        recentLikers: recentLikes.map((l) => ({
          ...l.user,
          likedVideoTitle: l.video.title,
          likedVideoId: l.video.id,
          likedAt: l.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('getLikesReceived error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch likes received' });
  }
};

