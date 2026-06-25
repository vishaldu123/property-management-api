/**
 * Authentication Service
 * Business logic for user registration and login
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import { organizationRepository } from '../repositories/organization.repository';
import prisma from '../config/prisma';
import { config } from '../config/environment';
import logger from '../utils/logger';
import { ValidationError, UnauthorizedError } from '../utils/errors';

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthToken {
  token: string;
  expiresIn: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

export class AuthService {
  private bcryptRounds = 10;

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { name, email, password, organizationName } = payload;

    // Validate email is unique
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      logger.warn('Registration attempted with existing email', { email });
      throw new ValidationError({ email: ['Email already exists'] });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, this.bcryptRounds);

    // Generate organization slug
    const organizationSlug = this.generateSlug(organizationName);

    logger.info('Creating new user and organization', { email, organizationName });

    try {
      // Use transaction to ensure atomicity
      const result = await prisma.$transaction(async (tx: any) => {
        // Create user
        const user = await tx.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
          },
        });

        // Create organization
        const organization = await tx.organization.create({
          data: {
            name: organizationName,
            slug: organizationSlug,
          },
        });

        // Create membership (user as OWNER)
        await tx.organizationUser.create({
          data: {
            organizationId: organization.id,
            userId: user.id,
            role: 'OWNER',
          },
        });

        return { user, organization };
      });

      const token = this.generateToken({
        userId: result.user.id,
        organizationId: result.organization.id,
      });

      logger.info('User registered successfully', { userId: result.user.id, organizationId: result.organization.id });

      return {
        token,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
        },
        organization: {
          id: result.organization.id,
          name: result.organization.name,
          slug: result.organization.slug,
        },
      };
    } catch (error) {
      logger.error('Registration failed', error as Error, { email });
      throw error;
    }
  }

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { email, password } = payload;

    logger.debug('Login attempt', { email });

    // Find user with memberships
    const user = await userRepository.findWithMemberships(
      (await userRepository.findByEmail(email))?.id || ''
    );

    if (!user || user.memberships.length === 0) {
      logger.warn('Login failed - user not found or no memberships', { email });
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      logger.warn('Login failed - invalid password', { email });
      throw new UnauthorizedError('Invalid credentials');
    }

    // Get first organization membership
    const membership = user.memberships[0];

    const token = this.generateToken({
      userId: user.id,
      organizationId: membership.organizationId,
    });

    logger.info('User logged in successfully', { userId: user.id });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      organization: {
        id: membership.organization.id,
        name: membership.organization.name,
        slug: membership.organization.slug,
      },
    };
  }

  private generateToken(payload: { userId: string; organizationId: string }): string {
    return jwt.sign(
      payload,
      config.jwtSecret,
      {
        expiresIn: config.jwtExpiresIn,
      } as any
    );
  }

  private generateSlug(text: string): string {
    const slug = text
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return slug || `org-${Date.now()}`;
  }
}

// Export singleton instance
export const authService = new AuthService();
