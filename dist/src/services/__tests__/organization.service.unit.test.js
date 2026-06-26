"use strict";
/**
 * Organization Service Unit Tests - Sprint 3
 */
Object.defineProperty(exports, "__esModule", { value: true });
const organization_service_1 = require("../organization.service");
const organization_repository_1 = require("../../repositories/organization.repository");
const errors_1 = require("../../utils/errors");
// Mock the repository
jest.mock('../../repositories/organization.repository');
describe('Organization Service - Sprint 3', () => {
    const mockActorContext = {
        userId: 'test-user-id',
        organizationId: 'test-org-id',
    };
    const mockOrganization = {
        id: 'test-org-id',
        name: 'Test Organization',
        slug: 'test-organization',
        email: 'test@org.com',
        phone: '+1234567890',
        website: 'https://test.com',
        logo: 'https://test.com/logo.png',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        country: 'Test Country',
        postalCode: '12345',
        timezone: 'UTC',
        currency: 'USD',
        subscriptionPlan: 'FREE',
        subscriptionStatus: 'TRIAL',
        isActive: true,
        description: 'Test organization',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        createdBy: 'test-user-id',
        updatedBy: 'test-user-id',
    };
    const mockSettings = {
        id: 'settings-id',
        organizationId: 'test-org-id',
        timezone: 'UTC',
        currency: 'USD',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm:ss',
        language: 'en',
        measurementUnit: 'metric',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'test-user-id',
        updatedBy: 'test-user-id',
    };
    const mockBranding = {
        id: 'branding-id',
        organizationId: 'test-org-id',
        logoUrl: 'https://test.com/logo.png',
        logoAltText: 'Test Logo',
        faviconUrl: 'https://test.com/favicon.ico',
        primaryColor: '#000000',
        secondaryColor: '#FFFFFF',
        accentColor: '#0066CC',
        theme: 'light',
        customCss: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'test-user-id',
        updatedBy: 'test-user-id',
    };
    const mockPreferences = {
        id: 'preferences-id',
        organizationId: 'test-org-id',
        emailNotifications: true,
        emailDigest: 'daily',
        twoFactorAuth: false,
        dataRetention: 90,
        backupFrequency: 'weekly',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'test-user-id',
        updatedBy: 'test-user-id',
    };
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('Settings Management', () => {
        it('should get organization settings successfully', async () => {
            organization_repository_1.organizationRepository.findByIdAndOrganizationId.mockResolvedValue(mockOrganization);
            organization_repository_1.organizationRepository.getOrCreateSettings.mockResolvedValue(mockSettings);
            const result = await organization_service_1.organizationService.getOrganizationSettings('test-org-id', mockActorContext);
            expect(result).toEqual(mockSettings);
            expect(organization_repository_1.organizationRepository.getOrCreateSettings).toHaveBeenCalledWith('test-org-id');
        });
        it('should throw error when organization not found for settings', async () => {
            organization_repository_1.organizationRepository.findByIdAndOrganizationId.mockResolvedValue(null);
            await expect(organization_service_1.organizationService.getOrganizationSettings('test-org-id', mockActorContext)).rejects.toThrow(errors_1.NotFoundError);
        });
        it('should throw error when cross-organization access attempted for settings', async () => {
            const differentOrgContext = { userId: 'test-user-id', organizationId: 'different-org-id' };
            await expect(organization_service_1.organizationService.getOrganizationSettings('test-org-id', differentOrgContext)).rejects.toThrow(errors_1.ForbiddenError);
        });
        it('should update organization settings successfully', async () => {
            const updatePayload = {
                timezone: 'America/New_York',
                currency: 'USD',
            };
            organization_repository_1.organizationRepository.findByIdAndOrganizationId.mockResolvedValue(mockOrganization);
            organization_repository_1.organizationRepository.updateSettings.mockResolvedValue({
                ...mockSettings,
                ...updatePayload,
            });
            const result = await organization_service_1.organizationService.updateOrganizationSettings('test-org-id', updatePayload, mockActorContext);
            expect(result.timezone).toBe('America/New_York');
            expect(organization_repository_1.organizationRepository.updateSettings).toHaveBeenCalledWith('test-org-id', expect.objectContaining(updatePayload));
        });
    });
    describe('Branding Management', () => {
        it('should get organization branding successfully', async () => {
            organization_repository_1.organizationRepository.findByIdAndOrganizationId.mockResolvedValue(mockOrganization);
            organization_repository_1.organizationRepository.getOrCreateBranding.mockResolvedValue(mockBranding);
            const result = await organization_service_1.organizationService.getOrganizationBranding('test-org-id', mockActorContext);
            expect(result).toEqual(mockBranding);
            expect(organization_repository_1.organizationRepository.getOrCreateBranding).toHaveBeenCalledWith('test-org-id');
        });
        it('should update organization branding successfully', async () => {
            const updatePayload = {
                primaryColor: '#FF0000',
                theme: 'dark',
            };
            organization_repository_1.organizationRepository.findByIdAndOrganizationId.mockResolvedValue(mockOrganization);
            organization_repository_1.organizationRepository.updateBranding.mockResolvedValue({
                ...mockBranding,
                ...updatePayload,
            });
            const result = await organization_service_1.organizationService.updateOrganizationBranding('test-org-id', updatePayload, mockActorContext);
            expect(result.primaryColor).toBe('#FF0000');
            expect(result.theme).toBe('dark');
        });
        it('should throw error when organization not found for branding', async () => {
            organization_repository_1.organizationRepository.findByIdAndOrganizationId.mockResolvedValue(null);
            await expect(organization_service_1.organizationService.getOrganizationBranding('test-org-id', mockActorContext)).rejects.toThrow(errors_1.NotFoundError);
        });
    });
    describe('Preferences Management', () => {
        it('should get organization preferences successfully', async () => {
            organization_repository_1.organizationRepository.findByIdAndOrganizationId.mockResolvedValue(mockOrganization);
            organization_repository_1.organizationRepository.getOrCreatePreferences.mockResolvedValue(mockPreferences);
            const result = await organization_service_1.organizationService.getOrganizationPreferences('test-org-id', mockActorContext);
            expect(result).toEqual(mockPreferences);
            expect(organization_repository_1.organizationRepository.getOrCreatePreferences).toHaveBeenCalledWith('test-org-id');
        });
        it('should update organization preferences successfully', async () => {
            const updatePayload = {
                emailNotifications: false,
                emailDigest: 'weekly',
                twoFactorAuth: true,
                dataRetention: 180,
            };
            organization_repository_1.organizationRepository.findByIdAndOrganizationId.mockResolvedValue(mockOrganization);
            organization_repository_1.organizationRepository.updatePreferences.mockResolvedValue({
                ...mockPreferences,
                ...updatePayload,
            });
            const result = await organization_service_1.organizationService.updateOrganizationPreferences('test-org-id', updatePayload, mockActorContext);
            expect(result.emailNotifications).toBe(false);
            expect(result.twoFactorAuth).toBe(true);
            expect(result.dataRetention).toBe(180);
        });
        it('should throw error when cross-organization access attempted for preferences', async () => {
            const differentOrgContext = { userId: 'test-user-id', organizationId: 'different-org-id' };
            await expect(organization_service_1.organizationService.getOrganizationPreferences('test-org-id', differentOrgContext)).rejects.toThrow(errors_1.ForbiddenError);
        });
    });
});
