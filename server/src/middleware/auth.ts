import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import prisma from '../config/prisma';

export interface AuthUserPayload {
  userId: string;
  email: string;
  username: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'vyro_ai_ultra_secure_jwt_secret_key_2026_x89';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please login.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, username: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'User account not found.' });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired access token.' });
  }
};

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, username: true, role: true },
      });
      if (user) {
        req.user = {
          userId: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        };
      }
    }
  } catch {
    // Ignore invalid token on optional auth
  }
  next();
};

export const requireRole = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. This action requires one of the following roles: ${roles.join(', ')}`,
      });
    }

    next();
  };
};

