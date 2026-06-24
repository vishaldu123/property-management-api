import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'STAFF' | 'ACCOUNTANT' | 'MEMBER';

export type Permission =
  | 'PROPERTY_CREATE'
  | 'PROPERTY_READ'
  | 'PROPERTY_UPDATE'
  | 'PROPERTY_DELETE'
  | 'UNIT_CREATE'
  | 'UNIT_READ'
  | 'UNIT_UPDATE'
  | 'UNIT_DELETE'
  | 'TENANT_CREATE'
  | 'TENANT_READ'
  | 'LEASE_CREATE'
  | 'LEASE_READ'
  | 'LEASE_UPDATE'
  | 'LEASE_DELETE'
  | 'PAYMENT_CREATE'
  | 'PAYMENT_READ'
  | 'PAYMENT_INITIATE'
  | 'PAYMENT_UPDATE'
  | 'PAYMENT_DELETE';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    organizationId: string;
    role: UserRole;
    email: string;
  };
}

const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
})();

const isUserRole = (role: unknown): role is UserRole =>
  typeof role === 'string' &&
  ['OWNER', 'ADMIN', 'MANAGER', 'STAFF', 'ACCOUNTANT', 'MEMBER'].includes(role);

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
    const payload = jwt.verify(token, JWT_SECRET);

    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid token payload');
    }

    const { userId, organizationId, role, email } = payload as {
      userId?: string;
      organizationId?: string;
      role?: string;
      email?: string;
    };

    if (!userId || !organizationId || !email || !isUserRole(role)) {
      throw new Error('Invalid token payload');
    }

    const membership = await prisma.organizationUser.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({ message: 'User membership not found for this organization' });
    }

    req.user = {
      userId,
      organizationId,
      role,
      email,
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

export const authorize = (permission: Permission | Permission[]) => {
  const requiredPermissions = Array.isArray(permission) ? permission : [permission];

  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authorization header missing or invalid' });
    }

    const rolePermission = await prisma.rolePermission.findFirst({
      where: {
        role: req.user.role,
        permission: {
          in: requiredPermissions,
        },
      },
    });

    if (!rolePermission) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};
