import { organizationService } from '../services/organization.service';
import { organizationRepository } from '../repositories/organization.repository';
import { ConflictError, ForbiddenError } from '../utils/errors';

describe('OrganizationService (unit)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws conflict when slug already exists', async () => {
    jest.spyOn(organizationRepository, 'findBySlug').mockResolvedValue({ id: 'org-1' } as any);
    jest.spyOn(organizationRepository, 'findByEmail').mockResolvedValue(null);

    await expect(
      organizationService.createOrganization(
        {
          name: 'Acme',
          slug: 'acme',
          email: 'acme@example.com',
        },
        'user-1'
      )
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('throws conflict when email already exists', async () => {
    jest.spyOn(organizationRepository, 'findBySlug').mockResolvedValue(null);
    jest.spyOn(organizationRepository, 'findByEmail').mockResolvedValue({ id: 'org-1' } as any);

    await expect(
      organizationService.createOrganization(
        {
          name: 'Acme',
          slug: 'acme',
          email: 'acme@example.com',
        },
        'user-1'
      )
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('blocks cross-organization updates', async () => {
    await expect(
      organizationService.updateOrganization(
        'org-2',
        { name: 'Updated Name' },
        { userId: 'user-1', organizationId: 'org-1' }
      )
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('lists organizations scoped to actor organization', async () => {
    const paginateSpy = jest.spyOn(organizationRepository, 'paginateScoped').mockResolvedValue({
      data: [{ id: 'org-1', name: 'Acme' }],
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    } as any);

    const result = await organizationService.listOrganizations(
      {
        page: 1,
        limit: 10,
        sort: 'createdAt',
        order: 'desc',
        includeDeleted: false,
      },
      { userId: 'user-1', organizationId: 'org-1' }
    );

    expect(result.meta.total).toBe(1);
    expect(paginateSpy).toHaveBeenCalledWith(expect.anything(), 'org-1', expect.objectContaining({ id: 'org-1' }));
  });
});
