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
