"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
process.env.NODE_ENV = 'test';
const property_service_1 = require("../../services/property.service");
const property_repository_1 = require("../../repositories/property.repository");
const organization_repository_1 = require("../../repositories/organization.repository");
const errors_1 = require("../../utils/errors");
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
            const input = {
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
            organization_repository_1.organizationRepository.findById.mockResolvedValue({ id: 'org-123' });
            property_repository_1.propertyRepository.findByCode.mockResolvedValue(null);
            property_repository_1.propertyRepository.create.mockResolvedValue(mockProperty);
            const result = await property_service_1.propertyService.createProperty(mockContext, input);
            expect(result).toEqual(mockProperty);
            expect(organization_repository_1.organizationRepository.findById).toHaveBeenCalledWith('org-123');
            expect(property_repository_1.propertyRepository.findByCode).toHaveBeenCalledWith('org-123', 'TEST-001');
        });
    });
    describe('getProperty', () => {
        it('should retrieve a property by ID', async () => {
            property_repository_1.propertyRepository.findByIdAndOrganizationId.mockResolvedValue(mockProperty);
            const result = await property_service_1.propertyService.getProperty(mockContext, 'prop-123');
            expect(result).toEqual(mockProperty);
            expect(property_repository_1.propertyRepository.findByIdAndOrganizationId).toHaveBeenCalledWith('prop-123', 'org-123');
        });
    });
    describe('updateProperty', () => {
        it('should update a property with valid input', async () => {
            const input = {
                name: 'Updated Property',
                status: 'Inactive',
            };
            const updatedProperty = { ...mockProperty, ...input };
            property_repository_1.propertyRepository.findByIdAndOrganizationId.mockResolvedValue(mockProperty);
            property_repository_1.propertyRepository.update.mockResolvedValue(updatedProperty);
            const result = await property_service_1.propertyService.updateProperty(mockContext, 'prop-123', input);
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
            property_repository_1.propertyRepository.filter.mockResolvedValue(mockResult);
            const result = await property_service_1.propertyService.listProperties(mockContext, { page: 1, limit: 10 });
            expect(result).toEqual(mockResult);
        });
    });
    describe('deleteProperty', () => {
        it('should soft delete a property', async () => {
            const deletedProperty = { ...mockProperty, deletedAt: new Date() };
            property_repository_1.propertyRepository.findByIdAndOrganizationId.mockResolvedValue(mockProperty);
            property_repository_1.propertyRepository.softDelete.mockResolvedValue(deletedProperty);
            const result = await property_service_1.propertyService.deleteProperty(mockContext, 'prop-123');
            expect(result).toEqual(deletedProperty);
        });
    });
    describe('restoreProperty', () => {
        it('should restore a soft-deleted property', async () => {
            const deletedProperty = { ...mockProperty, deletedAt: new Date() };
            const restoredProperty = { ...mockProperty, deletedAt: null };
            property_repository_1.propertyRepository.findById.mockResolvedValue(deletedProperty);
            property_repository_1.propertyRepository.restore.mockResolvedValue(restoredProperty);
            const result = await property_service_1.propertyService.restoreProperty(mockContext, 'prop-123');
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
            property_repository_1.propertyRepository.getStatistics.mockResolvedValue(mockStats);
            const result = await property_service_1.propertyService.getPropertyStatistics(mockContext);
            expect(result).toEqual(mockStats);
            expect(property_repository_1.propertyRepository.getStatistics).toHaveBeenCalledWith('org-123');
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
            const input = {
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
            organization_repository_1.organizationRepository.findById.mockResolvedValue({ id: 'org-123' });
            property_repository_1.propertyRepository.codeExists.mockResolvedValue(false);
            property_repository_1.propertyRepository.create.mockResolvedValue(mockProperty);
            const result = await property_service_1.propertyService.createProperty(mockContext, input);
            expect(result).toEqual(mockProperty);
            expect(organization_repository_1.organizationRepository.findById).toHaveBeenCalledWith('org-123');
            expect(property_repository_1.propertyRepository.codeExists).toHaveBeenCalledWith('org-123', 'TEST-001');
            expect(property_repository_1.propertyRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                organizationId: 'org-123',
                createdBy: 'user-123',
                updatedBy: 'user-123',
            }));
        });
        it('should fail if organization does not exist', async () => {
            const input = {
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
            organization_repository_1.organizationRepository.findById.mockResolvedValue(null);
            await expect(property_service_1.propertyService.createProperty(mockContext, input)).rejects.toThrow(errors_1.NotFoundError);
        });
        it('should fail if code already exists', async () => {
            const input = {
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
            organization_repository_1.organizationRepository.findById.mockResolvedValue({ id: 'org-123' });
            property_repository_1.propertyRepository.codeExists.mockResolvedValue(true);
            await expect(property_service_1.propertyService.createProperty(mockContext, input)).rejects.toThrow(errors_1.ConflictError);
        });
        it('should fail with invalid property type', async () => {
            const input = {
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
            organization_repository_1.organizationRepository.findById.mockResolvedValue({ id: 'org-123' });
            await expect(property_service_1.propertyService.createProperty(mockContext, input)).rejects.toThrow(errors_1.ValidationError);
        });
        it('should fail with invalid latitude', async () => {
            const input = {
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
            organization_repository_1.organizationRepository.findById.mockResolvedValue({ id: 'org-123' });
            property_repository_1.propertyRepository.codeExists.mockResolvedValue(false);
            await expect(property_service_1.propertyService.createProperty(mockContext, input)).rejects.toThrow(errors_1.ValidationError);
        });
        it('should fail with invalid longitude', async () => {
            const input = {
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
            organization_repository_1.organizationRepository.findById.mockResolvedValue({ id: 'org-123' });
            property_repository_1.propertyRepository.codeExists.mockResolvedValue(false);
            await expect(property_service_1.propertyService.createProperty(mockContext, input)).rejects.toThrow(errors_1.ValidationError);
        });
    });
    describe('updateProperty', () => {
        it('should update a property with valid input', async () => {
            const input = {
                name: 'Updated Property',
                status: 'Inactive',
            };
            const updatedProperty = { ...mockProperty, ...input };
            organization_repository_1.organizationRepository.findById.mockResolvedValue({ id: 'org-123' });
            property_repository_1.propertyRepository.findByIdAndOrganizationId.mockResolvedValue(mockProperty);
            property_repository_1.propertyRepository.codeExists.mockResolvedValue(false);
            property_repository_1.propertyRepository.update.mockResolvedValue(updatedProperty);
            const result = await property_service_1.propertyService.updateProperty(mockContext, 'prop-123', input);
            expect(result).toEqual(updatedProperty);
            expect(property_repository_1.propertyRepository.update).toHaveBeenCalledWith('prop-123', expect.objectContaining({
                updatedBy: 'user-123',
            }));
        });
        it('should fail to update non-existent property', async () => {
            const input = { name: 'Updated Property' };
            organization_repository_1.organizationRepository.findById.mockResolvedValue({ id: 'org-123' });
            property_repository_1.propertyRepository.findByIdAndOrganizationId.mockResolvedValue(null);
            await expect(property_service_1.propertyService.updateProperty(mockContext, 'non-existent', input)).rejects.toThrow(errors_1.NotFoundError);
        });
        it('should allow changing status to valid value', async () => {
            const input = { status: 'Archived' };
            const updatedProperty = { ...mockProperty, status: 'Archived' };
            organization_repository_1.organizationRepository.findById.mockResolvedValue({ id: 'org-123' });
            property_repository_1.propertyRepository.findByIdAndOrganizationId.mockResolvedValue(mockProperty);
            property_repository_1.propertyRepository.codeExists.mockResolvedValue(false);
            property_repository_1.propertyRepository.update.mockResolvedValue(updatedProperty);
            const result = await property_service_1.propertyService.updateProperty(mockContext, 'prop-123', input);
            expect(result.status).toBe('Archived');
        });
    });
    describe('getProperty', () => {
        it('should retrieve a property by ID', async () => {
            property_repository_1.propertyRepository.findByIdAndOrganizationId.mockResolvedValue(mockProperty);
            const result = await property_service_1.propertyService.getProperty(mockContext, 'prop-123');
            expect(result).toEqual(mockProperty);
            expect(property_repository_1.propertyRepository.findByIdAndOrganizationId).toHaveBeenCalledWith('prop-123', 'org-123');
        });
        it('should fail if property does not exist', async () => {
            property_repository_1.propertyRepository.findByIdAndOrganizationId.mockResolvedValue(null);
            await expect(property_service_1.propertyService.getProperty(mockContext, 'non-existent')).rejects.toThrow(errors_1.NotFoundError);
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
            property_repository_1.propertyRepository.paginateScoped.mockResolvedValue(mockResult);
            const result = await property_service_1.propertyService.listProperties(mockContext, { page: 1, limit: 10 });
            expect(result).toEqual(mockResult);
            expect(property_repository_1.propertyRepository.paginateScoped).toHaveBeenCalled();
        });
        it('should search properties', async () => {
            const mockResult = {
                data: [mockProperty],
                pagination: { page: 1, limit: 10, total: 1, pages: 1 },
            };
            property_repository_1.propertyRepository.search.mockResolvedValue(mockResult);
            const result = await property_service_1.propertyService.listProperties(mockContext, {
                search: 'Test Property',
                page: 1,
                limit: 10,
            });
            expect(result).toEqual(mockResult);
            expect(property_repository_1.propertyRepository.search).toHaveBeenCalledWith('org-123', 'Test Property', expect.any(Object));
        });
        it('should filter properties by status', async () => {
            const mockResult = {
                data: [mockProperty],
                pagination: { page: 1, limit: 10, total: 1, pages: 1 },
            };
            property_repository_1.propertyRepository.filter.mockResolvedValue(mockResult);
            const result = await property_service_1.propertyService.listProperties(mockContext, {
                status: 'Active',
                page: 1,
                limit: 10,
            });
            expect(result).toEqual(mockResult);
            expect(property_repository_1.propertyRepository.filter).toHaveBeenCalledWith('org-123', expect.any(Object), expect.any(Object));
        });
    });
    describe('deleteProperty', () => {
        it('should soft delete a property', async () => {
            const deletedProperty = { ...mockProperty, deletedAt: new Date() };
            property_repository_1.propertyRepository.findByIdAndOrganizationId.mockResolvedValue(mockProperty);
            property_repository_1.propertyRepository.softDelete.mockResolvedValue(deletedProperty);
            const result = await property_service_1.propertyService.deleteProperty(mockContext, 'prop-123');
            expect(result).toEqual(deletedProperty);
            expect(property_repository_1.propertyRepository.softDelete).toHaveBeenCalledWith('prop-123');
        });
        it('should fail to delete non-existent property', async () => {
            property_repository_1.propertyRepository.findByIdAndOrganizationId.mockResolvedValue(null);
            await expect(property_service_1.propertyService.deleteProperty(mockContext, 'non-existent')).rejects.toThrow(errors_1.NotFoundError);
        });
    });
    describe('restoreProperty', () => {
        it('should restore a soft-deleted property', async () => {
            const deletedProperty = { ...mockProperty, deletedAt: new Date() };
            const restoredProperty = { ...mockProperty, deletedAt: null };
            property_repository_1.propertyRepository.findById.mockResolvedValue(deletedProperty);
            property_repository_1.propertyRepository.restore.mockResolvedValue(restoredProperty);
            const result = await property_service_1.propertyService.restoreProperty(mockContext, 'prop-123');
            expect(result).toEqual(restoredProperty);
            expect(property_repository_1.propertyRepository.restore).toHaveBeenCalledWith('prop-123');
        });
        it('should fail to restore non-existent property', async () => {
            property_repository_1.propertyRepository.findById.mockResolvedValue(null);
            await expect(property_service_1.propertyService.restoreProperty(mockContext, 'non-existent')).rejects.toThrow(errors_1.NotFoundError);
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
            property_repository_1.propertyRepository.countByOrganization.mockResolvedValue(mockStats.total);
            property_repository_1.propertyRepository.getStatistics.mockResolvedValue(mockStats);
            const result = await property_service_1.propertyService.getPropertyStatistics(mockContext);
            expect(result).toEqual(mockStats);
            expect(property_repository_1.propertyRepository.getStatistics).toHaveBeenCalledWith('org-123');
        });
    });
});
