"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationRepository = exports.OrganizationRepository = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const repository_1 = require("../shared/core/repository");
class OrganizationRepository extends repository_1.BaseRepository {
    constructor() {
        super(prisma_1.default, 'organization');
    }
    async findBySlug(slug) {
        return prisma_1.default.organization.findUnique({
            where: { slug },
        });
    }
    async findByEmail(email) {
        return prisma_1.default.organization.findUnique({
            where: { email },
        });
    }
    async findByIdAndOrganizationId(id, organizationId) {
        if (id !== organizationId) {
            return null;
        }
        return prisma_1.default.organization.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });
    }
    async paginateScoped(pagination, organizationId, where) {
        const scopedWhere = {
            ...where,
            id: organizationId,
        };
        return this.paginate(pagination, scopedWhere);
    }
    // Settings Methods
    async getOrCreateSettings(organizationId) {
        const existing = await prisma_1.default.organizationSettings.findUnique({
            where: { organizationId },
        });
        if (existing) {
            return existing;
        }
        return prisma_1.default.organizationSettings.create({
            data: {
                organizationId,
                timezone: 'UTC',
                currency: 'USD',
                dateFormat: 'YYYY-MM-DD',
                timeFormat: 'HH:mm:ss',
                language: 'en',
                measurementUnit: 'metric',
            },
        });
    }
    async updateSettings(organizationId, data) {
        return prisma_1.default.organizationSettings.upsert({
            where: { organizationId },
            update: data,
            create: {
                organizationId,
                timezone: data.timezone ?? 'UTC',
                currency: data.currency ?? 'USD',
                dateFormat: data.dateFormat ?? 'YYYY-MM-DD',
                timeFormat: data.timeFormat ?? 'HH:mm:ss',
                language: data.language ?? 'en',
                measurementUnit: data.measurementUnit ?? 'metric',
            },
        });
    }
    async getSettings(organizationId) {
        return prisma_1.default.organizationSettings.findUnique({
            where: { organizationId },
        });
    }
    // Branding Methods
    async getOrCreateBranding(organizationId) {
        const existing = await prisma_1.default.organizationBranding.findUnique({
            where: { organizationId },
        });
        if (existing) {
            return existing;
        }
        return prisma_1.default.organizationBranding.create({
            data: {
                organizationId,
                primaryColor: '#000000',
                secondaryColor: '#FFFFFF',
                accentColor: '#0066CC',
                theme: 'light',
            },
        });
    }
    async updateBranding(organizationId, data) {
        return prisma_1.default.organizationBranding.upsert({
            where: { organizationId },
            update: data,
            create: {
                organizationId,
                logoUrl: data.logoUrl,
                logoAltText: data.logoAltText,
                faviconUrl: data.faviconUrl,
                primaryColor: data.primaryColor ?? '#000000',
                secondaryColor: data.secondaryColor ?? '#FFFFFF',
                accentColor: data.accentColor ?? '#0066CC',
                theme: data.theme ?? 'light',
                customCss: data.customCss,
            },
        });
    }
    async getBranding(organizationId) {
        return prisma_1.default.organizationBranding.findUnique({
            where: { organizationId },
        });
    }
    // Preferences Methods
    async getOrCreatePreferences(organizationId) {
        const existing = await prisma_1.default.organizationPreferences.findUnique({
            where: { organizationId },
        });
        if (existing) {
            return existing;
        }
        return prisma_1.default.organizationPreferences.create({
            data: {
                organizationId,
                emailNotifications: true,
                emailDigest: 'daily',
                twoFactorAuth: false,
                dataRetention: 90,
                backupFrequency: 'weekly',
            },
        });
    }
    async updatePreferences(organizationId, data) {
        return prisma_1.default.organizationPreferences.upsert({
            where: { organizationId },
            update: data,
            create: {
                organizationId,
                emailNotifications: data.emailNotifications ?? true,
                emailDigest: data.emailDigest ?? 'daily',
                twoFactorAuth: data.twoFactorAuth ?? false,
                dataRetention: data.dataRetention ?? 90,
                backupFrequency: data.backupFrequency ?? 'weekly',
            },
        });
    }
    async getPreferences(organizationId) {
        return prisma_1.default.organizationPreferences.findUnique({
            where: { organizationId },
        });
    }
}
exports.OrganizationRepository = OrganizationRepository;
// Export singleton instance
exports.organizationRepository = new OrganizationRepository();
