import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import { getJwtSecret } from '../utils/jwt';

interface MembershipWithOrganization {
  organizationId: string;
  role: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

interface UserWithMemberships {
  id: string;
  email: string;
  password: string;
  memberships: MembershipWithOrganization[];
}

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  organizationName: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  organizationId: z.string().uuid().optional(),
});

const createToken = (payload: { userId: string; organizationId: string; role: string; email: string }) => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '8h' });
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password, organizationName } = registerSchema.parse(req.body);

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const organizationSlug = organizationName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const organization = await tx.organization.create({
      data: {
        name: organizationName,
        slug: organizationSlug || `org-${Date.now()}`,
      },
    });

    const membership = await tx.organizationUser.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        role: 'OWNER',
      },
    });

    return { user, organization, membership };
  });

  const token = createToken({
    userId: result.user.id,
    organizationId: result.organization.id,
    role: result.membership.role,
    email: result.user.email,
  });

  return res.status(201).json({
    token,
    organization: {
      id: result.organization.id,
      name: result.organization.name,
      slug: result.organization.slug,
    },
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password, organizationId } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      memberships: {
        include: { organization: true },
      },
    },
  }) as UserWithMemberships | null;

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const membership = organizationId
    ? user.memberships.find((m: MembershipWithOrganization) => m.organizationId === organizationId)
    : user.memberships[0];

  if (!membership) {
    return res.status(403).json({ message: 'User is not associated with the requested organization' });
  }

  const token = createToken({
    userId: user.id,
    organizationId: membership.organizationId,
    role: membership.role,
    email: user.email,
  });

  return res.json({
    token,
    organization: {
      id: membership.organization.id,
      name: membership.organization.name,
      slug: membership.organization.slug,
    },
  });
};
