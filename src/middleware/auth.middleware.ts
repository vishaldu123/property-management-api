import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    organizationId: string;
    role: UserRole;
    email: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_secret';

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      organizationId: string;
      role: UserRole;
      email: string;
    };

    const membership = await prisma.organizationUser.findUnique({
      where: {
        organizationId_userId: {
          organizationId: payload.organizationId,
          userId: payload.userId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({ message: 'User membership not found for this organization' });
    }

    req.user = {
      userId: payload.userId,
      organizationId: payload.organizationId,
      role: payload.role,
      email: payload.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token', error: (error as Error).message });
  }
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};
