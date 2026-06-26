import { Organization, OrganizationSettings, OrganizationBranding, OrganizationPreferences, Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import { BaseRepository } from '../shared/core/repository';
import { PaginationRequest } from '../shared/core/pagination';

export class OrganizationRepository extends BaseRepository<Organization> {
  constructor() {
    super(prisma, 'organization');
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    return prisma.organization.findUnique({
      where: { slug },
    });
  }

  async findByEmail(email: string): Promise<Organization | null> {
    return prisma.organization.findUnique({
      where: { email },
    });
  }

  async findByIdAndOrganizationId(id: string, organizationId: string): Promise<Organization | null> {
    if (id !== organizationId) {
      return null;
    }

    return prisma.organization.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async paginateScoped(
    pagination: PaginationRequest,
    organizationId: string,
    where: Prisma.OrganizationWhereInput
  ) {
    const scopedWhere: Prisma.OrganizationWhereInput = {
      ...where,
      id: organizationId,
    };

    return this.paginate(pagination, scopedWhere);
  }

  // Settings Methods
  async getOrCreateSettings(organizationId: string): Promise<OrganizationSettings> {
    const existing = await prisma.organizationSettings.findUnique({
      where: { organizationId },
    });

    if (existing) {
      return existing;
    }

    return prisma.organizationSettings.create({
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

  async updateSettings(
    organizationId: string,
    data: Prisma.OrganizationSettingsUpdateInput
  ): Promise<OrganizationSettings> {
    return prisma.organizationSettings.upsert({
      where: { organizationId },
      update: data,
      create: {
        organizationId,
        timezone: (data.timezone as string) ?? 'UTC',
        currency: (data.currency as string) ?? 'USD',
        dateFormat: (data.dateFormat as string) ?? 'YYYY-MM-DD',
        timeFormat: (data.timeFormat as string) ?? 'HH:mm:ss',
        language: (data.language as string) ?? 'en',
        measurementUnit: (data.measurementUnit as string) ?? 'metric',
      },
    });
  }

  async getSettings(organizationId: string): Promise<OrganizationSettings | null> {
    return prisma.organizationSettings.findUnique({
      where: { organizationId },
    });
  }

  // Branding Methods
  async getOrCreateBranding(organizationId: string): Promise<OrganizationBranding> {
    const existing = await prisma.organizationBranding.findUnique({
      where: { organizationId },
    });

    if (existing) {
      return existing;
    }

    return prisma.organizationBranding.create({
      data: {
        organizationId,
        primaryColor: '#000000',
        secondaryColor: '#FFFFFF',
        accentColor: '#0066CC',
        theme: 'light',
      },
    });
  }

  async updateBranding(
    organizationId: string,
    data: Prisma.OrganizationBrandingUpdateInput
  ): Promise<OrganizationBranding> {
    return prisma.organizationBranding.upsert({
      where: { organizationId },
      update: data,
      create: {
        organizationId,
        logoUrl: (data.logoUrl as string | undefined),
        logoAltText: (data.logoAltText as string | undefined),
        faviconUrl: (data.faviconUrl as string | undefined),
        primaryColor: (data.primaryColor as string) ?? '#000000',
        secondaryColor: (data.secondaryColor as string) ?? '#FFFFFF',
        accentColor: (data.accentColor as string) ?? '#0066CC',
        theme: (data.theme as string) ?? 'light',
        customCss: (data.customCss as string | undefined),
      },
    });
  }

  async getBranding(organizationId: string): Promise<OrganizationBranding | null> {
    return prisma.organizationBranding.findUnique({
      where: { organizationId },
    });
  }

  // Preferences Methods
  async getOrCreatePreferences(organizationId: string): Promise<OrganizationPreferences> {
    const existing = await prisma.organizationPreferences.findUnique({
      where: { organizationId },
    });

    if (existing) {
      return existing;
    }

    return prisma.organizationPreferences.create({
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

  async updatePreferences(
    organizationId: string,
    data: Prisma.OrganizationPreferencesUpdateInput
  ): Promise<OrganizationPreferences> {
    return prisma.organizationPreferences.upsert({
      where: { organizationId },
      update: data,
      create: {
        organizationId,
        emailNotifications: (data.emailNotifications as boolean) ?? true,
        emailDigest: (data.emailDigest as string) ?? 'daily',
        twoFactorAuth: (data.twoFactorAuth as boolean) ?? false,
        dataRetention: (data.dataRetention as number) ?? 90,
        backupFrequency: (data.backupFrequency as string) ?? 'weekly',
      },
    });
  }

  async getPreferences(organizationId: string): Promise<OrganizationPreferences | null> {
    return prisma.organizationPreferences.findUnique({
      where: { organizationId },
    });
  }
}

// Export singleton instance
export const organizationRepository = new OrganizationRepository();
