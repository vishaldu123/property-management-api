process.env.NODE_ENV = 'test';
import { propertyService, CreatePropertyInput, UpdatePropertyInput } from '../../services/property.service';
import { propertyRepository } from '../../repositories/property.repository';
import { organizationRepository } from '../../repositories/organization.repository';
import { NotFoundError, ConflictError, ValidationError } from '../../utils/errors';

jest.mock('../../repositories/property.repository');
jest.mock('../../repositories/organization.repository');

describe('PropertyService', () => {
  const mockContext = {
    userId: 'user-123',
    organizationId: 'org-123',
  };

  const mockProperty = {
    id: 'prop-123',
    organizationId: 'org-123',
    name: 'Test Property',
    code: 'TEST-001',
    description: 'Test Description',
    propertyType: 'Apartment',
    status: 'Active',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    postalCode: '10001',
    latitude: 40.7128,
    longitude: -74.006,
    timezone: 'America/New_York',
    totalUnits: 10,
    yearBuilt: 2020,
    notes: 'Test notes',
    createdBy: 'user-123',
    updatedBy: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProperty', () => {
    it('should create a property with valid input', async () => {
      const input: CreatePropertyInput = {
        name: 'Test Property',
        code: 'TEST-001',
        description: 'Test Description',
        propertyType: 'Apartment',
        status: 'Active',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001',
        latitude: 40.7128,
        longitude: -74.006,
        timezone: 'America/New_York',
        totalUnits: 10,
        yearBuilt: 2020,
        notes: 'Test notes',
      };

      (organizationRepository.findById as jest.Mock).mockResolvedValue({ id: 'org-123' });
      (propertyRepository.findByCode as jest.Mock).mockResolvedValue(null);
      (propertyRepository.create as jest.Mock).mockResolvedValue(mockProperty);

      const result = await propertyService.createProperty(mockContext, input);

      expect(result).toEqual(mockProperty);
      expect(organizationRepository.findById).toHaveBeenCalledWith('org-123');
      expect(propertyRepository.findByCode).toHaveBeenCalledWith('org-123', 'TEST-001');
    });
  });

  describe('getProperty', () => {
    it('should retrieve a property by ID', async () => {
      (propertyRepository.findByIdAndOrganizationId as jest.Mock).mockResolvedValue(mockProperty);

      const result = await propertyService.getProperty(mockContext, 'prop-123');

      expect(result).toEqual(mockProperty);
      expect(propertyRepository.findByIdAndOrganizationId).toHaveBeenCalledWith('prop-123', 'org-123');
    });
  });

  describe('updateProperty', () => {
    it('should update a property with valid input', async () => {
      const input: UpdatePropertyInput = {
        name: 'Updated Property',
        status: 'Inactive',
      };

      const updatedProperty = { ...mockProperty, ...input };

      (propertyRepository.findByIdAndOrganizationId as jest.Mock).mockResolvedValue(mockProperty);
      (propertyRepository.update as jest.Mock).mockResolvedValue(updatedProperty);

      const result = await propertyService.updateProperty(mockContext, 'prop-123', input);

      expect(result).toEqual(updatedProperty);
    });
  });

  describe('listProperties', () => {
    it('should list properties with pagination', async () => {
      const mockResult = {
        data: [mockProperty],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1,
        },
      };

      (propertyRepository.filter as jest.Mock).mockResolvedValue(mockResult);

      const result = await propertyService.listProperties(mockContext, { page: 1, limit: 10 });

      expect(result).toEqual(mockResult);
    });
  });

  describe('deleteProperty', () => {
    it('should soft delete a property', async () => {
      const deletedProperty = { ...mockProperty, deletedAt: new Date() };

      (propertyRepository.findByIdAndOrganizationId as jest.Mock).mockResolvedValue(mockProperty);
      (propertyRepository.softDelete as jest.Mock).mockResolvedValue(deletedProperty);

      const result = await propertyService.deleteProperty(mockContext, 'prop-123');

      expect(result).toEqual(deletedProperty);
    });
  });

  describe('restoreProperty', () => {
    it('should restore a soft-deleted property', async () => {
      const deletedProperty = { ...mockProperty, deletedAt: new Date() };
      const restoredProperty = { ...mockProperty, deletedAt: null };

      (propertyRepository.findById as jest.Mock).mockResolvedValue(deletedProperty);
      (propertyRepository.restore as jest.Mock).mockResolvedValue(restoredProperty);

      const result = await propertyService.restoreProperty(mockContext, 'prop-123');

      expect(result).toEqual(restoredProperty);
    });
  });

  describe('getPropertyStatistics', () => {
    it('should return statistics for properties', async () => {
      const mockStats = {
        total: 10,
        active: 6,
        draft: 2,
        inactive: 1,
        archived: 1,
      };

      (propertyRepository.getStatistics as jest.Mock).mockResolvedValue(mockStats);

      const result = await propertyService.getPropertyStatistics(mockContext);

      expect(result).toEqual(mockStats);
      expect(propertyRepository.getStatistics).toHaveBeenCalledWith('org-123');
    });
  });
});

jest.mock('../../repositories/property.repository');
jest.mock('../../repositories/organization.repository');
jest.mock('../../config/prisma');

describe('PropertyService', () => {
  const mockContext = {
    userId: 'user-123',
    organizationId: 'org-123',
  };

  const mockProperty = {
    id: 'prop-123',
    organizationId: 'org-123',
    name: 'Test Property',
    code: 'TEST-001',
    description: 'Test Description',
    propertyType: 'Apartment',
    status: 'Active',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    postalCode: '10001',
    latitude: 40.7128,
    longitude: -74.006,
    timezone: 'America/New_York',
    totalUnits: 10,
    yearBuilt: 2020,
    notes: 'Test notes',
    createdBy: 'user-123',
    updatedBy: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProperty', () => {
    it('should create a property with valid input', async () => {
      const input: CreatePropertyInput = {
        name: 'Test Property',
        code: 'TEST-001',
        description: 'Test Description',
        propertyType: 'Apartment',
        status: 'Active',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001',
        latitude: 40.7128,
        longitude: -74.006,
        timezone: 'America/New_York',
        totalUnits: 10,
        yearBuilt: 2020,
        notes: 'Test notes',
      };

      (organizationRepository.findById as jest.Mock).mockResolvedValue({ id: 'org-123' });
      (propertyRepository.codeExists as jest.Mock).mockResolvedValue(false);
      (propertyRepository.create as jest.Mock).mockResolvedValue(mockProperty);

      const result = await propertyService.createProperty(mockContext, input);

      expect(result).toEqual(mockProperty);
      expect(organizationRepository.findById).toHaveBeenCalledWith('org-123');
      expect(propertyRepository.codeExists).toHaveBeenCalledWith('org-123', 'TEST-001');
      expect(propertyRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: 'org-123',
          createdBy: 'user-123',
          updatedBy: 'user-123',
        })
      );
    });

    it('should fail if organization does not exist', async () => {
      const input: CreatePropertyInput = {
        name: 'Test Property',
        code: 'TEST-001',
        propertyType: 'Apartment',
        status: 'Active',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001',
      };

      (organizationRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(propertyService.createProperty(mockContext, input)).rejects.toThrow(NotFoundError);
    });

    it('should fail if code already exists', async () => {
      const input: CreatePropertyInput = {
        name: 'Test Property',
        code: 'TEST-001',
        propertyType: 'Apartment',
        status: 'Active',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001',
      };

      (organizationRepository.findById as jest.Mock).mockResolvedValue({ id: 'org-123' });
      (propertyRepository.findByCode as jest.Mock).mockResolvedValue(mockProperty);

      await expect(propertyService.createProperty(mockContext, input)).rejects.toThrow(ConflictError);
    });

    it('should fail with invalid property type', async () => {
      const input: any = {
        name: 'Test Property',
        code: 'TEST-001',
        propertyType: 'InvalidType',
        status: 'Active',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001',
      };

      (organizationRepository.findById as jest.Mock).mockResolvedValue({ id: 'org-123' });

      await expect(propertyService.createProperty(mockContext, input)).rejects.toThrow(ValidationError);
    });

    it('should fail with invalid latitude', async () => {
      const input: any = {
        name: 'Test Property',
        code: 'TEST-001',
        propertyType: 'Apartment',
        status: 'Active',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001',
        latitude: 100, // Invalid: must be -90 to 90
      };

      (organizationRepository.findById as jest.Mock).mockResolvedValue({ id: 'org-123' });
      (propertyRepository.findByCode as jest.Mock).mockResolvedValue(null);

      await expect(propertyService.createProperty(mockContext, input)).rejects.toThrow(ValidationError);
    });

    it('should fail with invalid longitude', async () => {
      const input: any = {
        name: 'Test Property',
        code: 'TEST-001',
        propertyType: 'Apartment',
        status: 'Active',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001',
        longitude: 200, // Invalid: must be -180 to 180
      };

      (organizationRepository.findById as jest.Mock).mockResolvedValue({ id: 'org-123' });
      (propertyRepository.findByCode as jest.Mock).mockResolvedValue(null);

      await expect(propertyService.createProperty(mockContext, input)).rejects.toThrow(ValidationError);
    });
  });

  describe('updateProperty', () => {
    it('should update a property with valid input', async () => {
      const input: UpdatePropertyInput = {
        name: 'Updated Property',
        status: 'Inactive',
      };

      const updatedProperty = { ...mockProperty, ...input };

      (organizationRepository.findById as jest.Mock).mockResolvedValue({ id: 'org-123' });
      (propertyRepository.findByIdAndOrganizationId as jest.Mock).mockResolvedValue(mockProperty);
      (propertyRepository.codeExists as jest.Mock).mockResolvedValue(false);
      (propertyRepository.update as jest.Mock).mockResolvedValue(updatedProperty);

      const result = await propertyService.updateProperty(mockContext, 'prop-123', input);

      expect(result).toEqual(updatedProperty);
      expect(propertyRepository.update).toHaveBeenCalledWith(
        'prop-123',
        expect.objectContaining({
          updatedBy: 'user-123',
        })
      );
    });

    it('should fail to update non-existent property', async () => {
      const input: UpdatePropertyInput = { name: 'Updated Property' };

      (organizationRepository.findById as jest.Mock).mockResolvedValue({ id: 'org-123' });
      (propertyRepository.findByIdAndOrganizationId as jest.Mock).mockResolvedValue(null);

      await expect(propertyService.updateProperty(mockContext, 'non-existent', input)).rejects.toThrow(NotFoundError);
    });

    it('should allow changing status to valid value', async () => {
      const input: UpdatePropertyInput = { status: 'Archived' };
      const updatedProperty = { ...mockProperty, status: 'Archived' };

      (organizationRepository.findById as jest.Mock).mockResolvedValue({ id: 'org-123' });
      (propertyRepository.findByIdAndOrganizationId as jest.Mock).mockResolvedValue(mockProperty);
      (propertyRepository.codeExists as jest.Mock).mockResolvedValue(false);
      (propertyRepository.update as jest.Mock).mockResolvedValue(updatedProperty);

      const result = await propertyService.updateProperty(mockContext, 'prop-123', input);

      expect(result.status).toBe('Archived');
    });
  });

  describe('getProperty', () => {
    it('should retrieve a property by ID', async () => {
      (propertyRepository.findByIdAndOrganizationId as jest.Mock).mockResolvedValue(mockProperty);

      const result = await propertyService.getProperty(mockContext, 'prop-123');

      expect(result).toEqual(mockProperty);
      expect(propertyRepository.findByIdAndOrganizationId).toHaveBeenCalledWith('prop-123', 'org-123');
    });

    it('should fail if property does not exist', async () => {
      (propertyRepository.findByIdAndOrganizationId as jest.Mock).mockResolvedValue(null);

      await expect(propertyService.getProperty(mockContext, 'non-existent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('listProperties', () => {
    it('should list properties with pagination', async () => {
      const mockResult = {
        data: [mockProperty],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1,
        },
      };

      (propertyRepository.paginateScoped as jest.Mock).mockResolvedValue(mockResult);

      const result = await propertyService.listProperties(mockContext, { page: 1, limit: 10 });

      expect(result).toEqual(mockResult);
      expect(propertyRepository.paginateScoped).toHaveBeenCalled();
    });

    it('should search properties', async () => {
      const mockResult = {
        data: [mockProperty],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
      };

      (propertyRepository.search as jest.Mock).mockResolvedValue(mockResult);

      const result = await propertyService.listProperties(mockContext, {
        search: 'Test Property',
        page: 1,
        limit: 10,
      });

      expect(result).toEqual(mockResult);
      expect(propertyRepository.search).toHaveBeenCalledWith('org-123', 'Test Property', expect.any(Object));
    });

    it('should filter properties by status', async () => {
      const mockResult = {
        data: [mockProperty],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
      };

      (propertyRepository.filter as jest.Mock).mockResolvedValue(mockResult);

      const result = await propertyService.listProperties(mockContext, {
        status: 'Active',
        page: 1,
        limit: 10,
      });

      expect(result).toEqual(mockResult);
      expect(propertyRepository.filter).toHaveBeenCalledWith('org-123', expect.any(Object), expect.any(Object));
    });
  });

  describe('deleteProperty', () => {
    it('should soft delete a property', async () => {
      const deletedProperty = { ...mockProperty, deletedAt: new Date() };

      (propertyRepository.findByIdAndOrganizationId as jest.Mock).mockResolvedValue(mockProperty);
      (propertyRepository.softDelete as jest.Mock).mockResolvedValue(deletedProperty);

      const result = await propertyService.deleteProperty(mockContext, 'prop-123');

      expect(result).toEqual(deletedProperty);
      expect(propertyRepository.softDelete).toHaveBeenCalledWith('prop-123');
    });

    it('should fail to delete non-existent property', async () => {
      (propertyRepository.findByIdAndOrganizationId as jest.Mock).mockResolvedValue(null);

      await expect(propertyService.deleteProperty(mockContext, 'non-existent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('restoreProperty', () => {
    it('should restore a soft-deleted property', async () => {
      const deletedProperty = { ...mockProperty, deletedAt: new Date() };
      const restoredProperty = { ...mockProperty, deletedAt: null };

      (propertyRepository.findById as jest.Mock).mockResolvedValue(deletedProperty);
      (propertyRepository.restore as jest.Mock).mockResolvedValue(restoredProperty);

      const result = await propertyService.restoreProperty(mockContext, 'prop-123');

      expect(result).toEqual(restoredProperty);
      expect(propertyRepository.restore).toHaveBeenCalledWith('prop-123');
    });

    it('should fail to restore non-existent property', async () => {
      (propertyRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(propertyService.restoreProperty(mockContext, 'non-existent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getPropertyStatistics', () => {
    it('should return statistics for properties', async () => {
      const mockStats = {
        total: 10,
        active: 6,
        draft: 2,
        inactive: 1,
        archived: 1,
      };

      (propertyRepository.countByOrganization as jest.Mock).mockResolvedValue(mockStats.total);
      (propertyRepository.getStatistics as jest.Mock).mockResolvedValue(mockStats);

      const result = await propertyService.getPropertyStatistics(mockContext);

      expect(result).toEqual(mockStats);
      expect(propertyRepository.getStatistics).toHaveBeenCalledWith('org-123');
    });
  });
});
