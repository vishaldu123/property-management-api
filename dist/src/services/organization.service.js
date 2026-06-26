"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationService = exports.OrganizationService = void 0;
const client_1 = require("@prisma/client");
const organization_repository_1 = require("../repositories/organization.repository");
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
const pagination_1 = require("../shared/core/pagination");
const filtering_1 = require("../shared/core/filtering");
class OrganizationService {
    async createOrganization(payload, actorUserId) {
        const slug = payload.slug ?? this.generateSlug(payload.name);
        await this.ensureUniqueFields(slug, payload.email);
        const organization = await organization_repository_1.organizationRepository.create({
            ...payload,
            slug,
            createdBy: actorUserId,
            updatedBy: actorUserId,
        });
        logger_1.default.info('Organization created successfully', { organizationId: organization.id, actorUserId });
        return organization;
    }
    async updateOrganization(organizationId, payload, context) {
        this.ensureOrganizationIsolation(organizationId, context.organizationId);
        await this.ensureOrganizationExists(organizationId);
        if (payload.slug || payload.email) {
            await this.ensureUniqueFields(payload.slug, payload.email, organizationId);
        }
        const organization = await organization_repository_1.organizationRepository.update(organizationId, {
            ...payload,
            updatedBy: context.userId,
        });
        logger_1.default.info('Organization updated successfully', { organizationId, actorUserId: context.userId });
        return organization;
    }
    async softDeleteOrganization(organizationId, context) {
        this.ensureOrganizationIsolation(organizationId, context.organizationId);
        await this.ensureOrganizationExists(organizationId);
        const organization = await organization_repository_1.organizationRepository.softDelete(organizationId);
        logger_1.default.warn('Organization soft deleted', { organizationId, actorUserId: context.userId });
        return organization;
    }
    async restoreOrganization(organizationId, context) {
        this.ensureOrganizationIsolation(organizationId, context.organizationId);
        const organization = await organization_repository_1.organizationRepository.findById(organizationId);
        if (!organization || !organization.deletedAt) {
            throw new errors_1.NotFoundError('Organization');
        }
        const restored = await organization_repository_1.organizationRepository.restore(organizationId);
        logger_1.default.info('Organization restored', { organizationId, actorUserId: context.userId });
        return restored;
    }
    async getOrganization(organizationId, context) {
        this.ensureOrganizationIsolation(organizationId, context.organizationId);
        const organization = await organization_repository_1.organizationRepository.findByIdAndOrganizationId(organizationId, context.organizationId);
        if (!organization) {
            throw new errors_1.NotFoundError('Organization');
        }
        return organization;
    }
    async listOrganizations(query, context) {
        const pagination = new pagination_1.PaginationRequest(query.page, query.limit, query.sort, query.order, query.search);
        const where = this.buildWhereClause(query, context.organizationId);
        return organization_repository_1.organizationRepository.paginateScoped(pagination, context.organizationId, where);
    }
    // Settings Methods
    async getOrganizationSettings(organizationId, context) {
        this.ensureOrganizationIsolation(organizationId, context.organizationId);
        await this.ensureOrganizationExists(organizationId);
        const settings = await organization_repository_1.organizationRepository.getOrCreateSettings(organizationId);
        logger_1.default.info('Organization settings retrieved', { organizationId });
        return settings;
    }
    async updateOrganizationSettings(organizationId, payload, context) {
        this.ensureOrganizationIsolation(organizationId, context.organizationId);
        await this.ensureOrganizationExists(organizationId);
        const settings = await organization_repository_1.organizationRepository.updateSettings(organizationId, {
            ...payload,
            updatedBy: context.userId,
        });
        logger_1.default.info('Organization settings updated', { organizationId, actorUserId: context.userId });
        return settings;
    }
    // Branding Methods
    async getOrganizationBranding(organizationId, context) {
        this.ensureOrganizationIsolation(organizationId, context.organizationId);
        await this.ensureOrganizationExists(organizationId);
        const branding = await organization_repository_1.organizationRepository.getOrCreateBranding(organizationId);
        logger_1.default.info('Organization branding retrieved', { organizationId });
        return branding;
    }
    async updateOrganizationBranding(organizationId, payload, context) {
        this.ensureOrganizationIsolation(organizationId, context.organizationId);
        await this.ensureOrganizationExists(organizationId);
        const branding = await organization_repository_1.organizationRepository.updateBranding(organizationId, {
            ...payload,
            updatedBy: context.userId,
        });
        logger_1.default.info('Organization branding updated', { organizationId, actorUserId: context.userId });
        return branding;
    }
    // Preferences Methods
    async getOrganizationPreferences(organizationId, context) {
        this.ensureOrganizationIsolation(organizationId, context.organizationId);
        await this.ensureOrganizationExists(organizationId);
        const preferences = await organization_repository_1.organizationRepository.getOrCreatePreferences(organizationId);
        logger_1.default.info('Organization preferences retrieved', { organizationId });
        return preferences;
    }
    async updateOrganizationPreferences(organizationId, payload, context) {
        this.ensureOrganizationIsolation(organizationId, context.organizationId);
        await this.ensureOrganizationExists(organizationId);
        const preferences = await organization_repository_1.organizationRepository.updatePreferences(organizationId, {
            ...payload,
            updatedBy: context.userId,
        });
        logger_1.default.info('Organization preferences updated', { organizationId, actorUserId: context.userId });
        return preferences;
    }
    buildWhereClause(query, organizationId) {
        const searchClause = query.search
            ? {
                OR: [
                    { name: { contains: query.search, mode: client_1.Prisma.QueryMode.insensitive } },
                    { slug: { contains: query.search, mode: client_1.Prisma.QueryMode.insensitive } },
                    { email: { contains: query.search, mode: client_1.Prisma.QueryMode.insensitive } },
                    { city: { contains: query.search, mode: client_1.Prisma.QueryMode.insensitive } },
                    { country: { contains: query.search, mode: client_1.Prisma.QueryMode.insensitive } },
                ],
            }
            : {};
        const filterClause = query.filters
            ? filtering_1.FilterBuilder.buildWhereClause(filtering_1.FilterBuilder.parseFilterString(query.filters))
            : {};
        return {
            id: organizationId,
            deletedAt: query.includeDeleted ? undefined : null,
            ...searchClause,
            ...filterClause,
        };
    }
    async ensureOrganizationExists(organizationId) {
        const organization = await organization_repository_1.organizationRepository.findByIdAndOrganizationId(organizationId, organizationId);
        if (!organization) {
            throw new errors_1.NotFoundError('Organization');
        }
    }
    ensureOrganizationIsolation(requestedOrganizationId, actorOrganizationId) {
        if (requestedOrganizationId !== actorOrganizationId) {
            throw new errors_1.ForbiddenError('Access denied for requested organization');
        }
    }
    async ensureUniqueFields(slug, email, excludeId) {
        if (slug) {
            const existingSlug = await organization_repository_1.organizationRepository.findBySlug(slug);
            if (existingSlug && existingSlug.id !== excludeId) {
                throw new errors_1.ConflictError('Organization slug already exists');
            }
        }
        if (email) {
            const existingEmail = await organization_repository_1.organizationRepository.findByEmail(email);
            if (existingEmail && existingEmail.id !== excludeId) {
                throw new errors_1.ConflictError('Organization email already exists');
            }
        }
    }
    generateSlug(name) {
        return name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
}
exports.OrganizationService = OrganizationService;
exports.organizationService = new OrganizationService();
