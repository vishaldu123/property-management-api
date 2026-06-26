"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const organization_service_1 = require("../services/organization.service");
const organization_repository_1 = require("../repositories/organization.repository");
const errors_1 = require("../utils/errors");
describe('OrganizationService (unit)', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('throws conflict when slug already exists', async () => {
        jest.spyOn(organization_repository_1.organizationRepository, 'findBySlug').mockResolvedValue({ id: 'org-1' });
        jest.spyOn(organization_repository_1.organizationRepository, 'findByEmail').mockResolvedValue(null);
        await expect(organization_service_1.organizationService.createOrganization({
            name: 'Acme',
            slug: 'acme',
            email: 'acme@example.com',
        }, 'user-1')).rejects.toBeInstanceOf(errors_1.ConflictError);
    });
    it('throws conflict when email already exists', async () => {
        jest.spyOn(organization_repository_1.organizationRepository, 'findBySlug').mockResolvedValue(null);
        jest.spyOn(organization_repository_1.organizationRepository, 'findByEmail').mockResolvedValue({ id: 'org-1' });
        await expect(organization_service_1.organizationService.createOrganization({
            name: 'Acme',
            slug: 'acme',
            email: 'acme@example.com',
        }, 'user-1')).rejects.toBeInstanceOf(errors_1.ConflictError);
    });
    it('blocks cross-organization updates', async () => {
        await expect(organization_service_1.organizationService.updateOrganization('org-2', { name: 'Updated Name' }, { userId: 'user-1', organizationId: 'org-1' })).rejects.toBeInstanceOf(errors_1.ForbiddenError);
    });
    it('lists organizations scoped to actor organization', async () => {
        const paginateSpy = jest.spyOn(organization_repository_1.organizationRepository, 'paginateScoped').mockResolvedValue({
            data: [{ id: 'org-1', name: 'Acme' }],
            meta: {
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
                hasNextPage: false,
                hasPreviousPage: false,
            },
        });
        const result = await organization_service_1.organizationService.listOrganizations({
            page: 1,
            limit: 10,
            sort: 'createdAt',
            order: 'desc',
            includeDeleted: false,
        }, { userId: 'user-1', organizationId: 'org-1' });
        expect(result.meta.total).toBe(1);
        expect(paginateSpy).toHaveBeenCalledWith(expect.anything(), 'org-1', expect.objectContaining({ id: 'org-1' }));
    });
});
