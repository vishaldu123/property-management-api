import { Prisma } from '@prisma/client';
import { organizationRepository } from '../repositories/organization.repository';
import logger from '../utils/logger';
import { ConflictError, ForbiddenError, NotFoundError } from '../utils/errors';
import { PaginationRequest } from '../shared/core/pagination';
import { FilterBuilder } from '../shared/core/filtering';
import {
  CreateOrganizationInput,
  ListOrganizationsQuery,
  UpdateOrganizationInput,
  OrganizationSettingsInput,
  OrganizationBrandingInput,
  OrganizationPreferencesInput,
} from '../validators/organization.validators';

interface OrganizationActorContext {
  userId: string;
  organizationId: string;
}

export class OrganizationService {
  async createOrganization(payload: CreateOrganizationInput, actorUserId?: string) {
    const slug = payload.slug ?? this.generateSlug(payload.name);

    await this.ensureUniqueFields(slug, payload.email);

    const organization = await organizationRepository.create({
      ...payload,
      slug,
      createdBy: actorUserId,
      updatedBy: actorUserId,
    });

    logger.info('Organization created successfully', { organizationId: organization.id, actorUserId });
    return organization;
  }

  async updateOrganization(
    organizationId: string,
    payload: UpdateOrganizationInput,
    context: OrganizationActorContext
  ) {
    this.ensureOrganizationIsolation(organizationId, context.organizationId);
    await this.ensureOrganizationExists(organizationId);

    if (payload.slug || payload.email) {
      await this.ensureUniqueFields(payload.slug, payload.email, organizationId);
    }

    const organization = await organizationRepository.update(organizationId, {
      ...payload,
      updatedBy: context.userId,
    });

    logger.info('Organization updated successfully', { organizationId, actorUserId: context.userId });
    return organization;
  }

  async softDeleteOrganization(organizationId: string, context: OrganizationActorContext) {
    this.ensureOrganizationIsolation(organizationId, context.organizationId);
    await this.ensureOrganizationExists(organizationId);

    const organization = await organizationRepository.softDelete(organizationId);
    logger.warn('Organization soft deleted', { organizationId, actorUserId: context.userId });
    return organization;
  }

  async restoreOrganization(organizationId: string, context: OrganizationActorContext) {
    this.ensureOrganizationIsolation(organizationId, context.organizationId);

    const organization = await organizationRepository.findById(organizationId);
    if (!organization || !organization.deletedAt) {
      throw new NotFoundError('Organization');
    }

    const restored = await organizationRepository.restore(organizationId);
    logger.info('Organization restored', { organizationId, actorUserId: context.userId });
    return restored;
  }

  async getOrganization(organizationId: string, context: OrganizationActorContext) {
    this.ensureOrganizationIsolation(organizationId, context.organizationId);

    const organization = await organizationRepository.findByIdAndOrganizationId(
      organizationId,
      context.organizationId
    );

    if (!organization) {
      throw new NotFoundError('Organization');
    }

    return organization;
  }

  async listOrganizations(query: ListOrganizationsQuery, context: OrganizationActorContext) {
    const pagination = new PaginationRequest(query.page, query.limit, query.sort, query.order, query.search);
    const where = this.buildWhereClause(query, context.organizationId);
    return organizationRepository.paginateScoped(pagination, context.organizationId, where);
  }

  // Settings Methods
  async getOrganizationSettings(organizationId: string, context: OrganizationActorContext) {
    this.ensureOrganizationIsolation(organizationId, context.organizationId);
    await this.ensureOrganizationExists(organizationId);

    const settings = await organizationRepository.getOrCreateSettings(organizationId);
    logger.info('Organization settings retrieved', { organizationId });
    return settings;
  }

  async updateOrganizationSettings(
    organizationId: string,
    payload: OrganizationSettingsInput,
    context: OrganizationActorContext
  ) {
    this.ensureOrganizationIsolation(organizationId, context.organizationId);
    await this.ensureOrganizationExists(organizationId);

    const settings = await organizationRepository.updateSettings(organizationId, {
      ...payload,
      updatedBy: context.userId,
    });

    logger.info('Organization settings updated', { organizationId, actorUserId: context.userId });
    return settings;
  }

  // Branding Methods
  async getOrganizationBranding(organizationId: string, context: OrganizationActorContext) {
    this.ensureOrganizationIsolation(organizationId, context.organizationId);
    await this.ensureOrganizationExists(organizationId);

    const branding = await organizationRepository.getOrCreateBranding(organizationId);
    logger.info('Organization branding retrieved', { organizationId });
    return branding;
  }

  async updateOrganizationBranding(
    organizationId: string,
    payload: OrganizationBrandingInput,
    context: OrganizationActorContext
  ) {
    this.ensureOrganizationIsolation(organizationId, context.organizationId);
    await this.ensureOrganizationExists(organizationId);

    const branding = await organizationRepository.updateBranding(organizationId, {
      ...payload,
      updatedBy: context.userId,
    });

    logger.info('Organization branding updated', { organizationId, actorUserId: context.userId });
    return branding;
  }

  // Preferences Methods
  async getOrganizationPreferences(organizationId: string, context: OrganizationActorContext) {
    this.ensureOrganizationIsolation(organizationId, context.organizationId);
    await this.ensureOrganizationExists(organizationId);

    const preferences = await organizationRepository.getOrCreatePreferences(organizationId);
    logger.info('Organization preferences retrieved', { organizationId });
    return preferences;
  }

  async updateOrganizationPreferences(
    organizationId: string,
    payload: OrganizationPreferencesInput,
    context: OrganizationActorContext
  ) {
    this.ensureOrganizationIsolation(organizationId, context.organizationId);
    await this.ensureOrganizationExists(organizationId);

    const preferences = await organizationRepository.updatePreferences(organizationId, {
      ...payload,
      updatedBy: context.userId,
    });

    logger.info('Organization preferences updated', { organizationId, actorUserId: context.userId });
    return preferences;
  }

  private buildWhereClause(
    query: ListOrganizationsQuery,
    organizationId: string
  ): Prisma.OrganizationWhereInput {
    const searchClause = query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
            { slug: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
            { city: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
            { country: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

    const filterClause = query.filters
      ? FilterBuilder.buildWhereClause(FilterBuilder.parseFilterString(query.filters))
      : {};

    return {
      id: organizationId,
      deletedAt: query.includeDeleted ? undefined : null,
      ...searchClause,
      ...filterClause,
    };
  }

  private async ensureOrganizationExists(organizationId: string): Promise<void> {
    const organization = await organizationRepository.findByIdAndOrganizationId(organizationId, organizationId);
    if (!organization) {
      throw new NotFoundError('Organization');
    }
  }

  private ensureOrganizationIsolation(requestedOrganizationId: string, actorOrganizationId: string): void {
    if (requestedOrganizationId !== actorOrganizationId) {
      throw new ForbiddenError('Access denied for requested organization');
    }
  }

  private async ensureUniqueFields(slug?: string, email?: string, excludeId?: string): Promise<void> {
    if (slug) {
      const existingSlug = await organizationRepository.findBySlug(slug);
      if (existingSlug && existingSlug.id !== excludeId) {
        throw new ConflictError('Organization slug already exists');
      }
    }

    if (email) {
      const existingEmail = await organizationRepository.findByEmail(email);
      if (existingEmail && existingEmail.id !== excludeId) {
        throw new ConflictError('Organization email already exists');
      }
    }
  }

  private generateSlug(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

export const organizationService = new OrganizationService();
