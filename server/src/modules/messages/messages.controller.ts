import { Request, Response } from 'express';
import prisma from '../../config/prisma';

export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
        user2: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const formatted = conversations.map((c) => {
      const partner = c.user1Id === userId ? c.user2 : c.user1;
      return {
        id: c.id,
        partner,
        lastMessage: c.messages[0] || null,
        updatedAt: c.updatedAt,
      };
    });

    return res.json({ success: true, data: formatted });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch conversations' });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user!.userId;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || (conversation.user1Id !== userId && conversation.user2Id !== userId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    return res.json({ success: true, data: messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { recipientId, text, conversationId: existingConvId } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    let conversationId = existingConvId;

    if (!conversationId) {
      if (!recipientId) {
        return res.status(400).json({ success: false, message: 'Recipient ID or conversation ID required' });
      }

      // Find or create conversation
      let conv = await prisma.conversation.findFirst({
        where: {
          OR: [
            { user1Id: userId, user2Id: recipientId },
            { user1Id: recipientId, user2Id: userId },
          ],
        },
      });

      if (!conv) {
        conv = await prisma.conversation.create({
          data: {
            user1Id: userId,
            user2Id: recipientId,
          },
        });
      }
      conversationId = conv.id;
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        text: text.trim(),
      },
      include: {
        sender: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error('sendMessage error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

