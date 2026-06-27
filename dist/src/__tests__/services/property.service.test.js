"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
process.env.NODE_ENV = 'test';
const property_service_1 = require("../../services/property.service");
const property_repository_1 = require("../../repositories/property.repository");
const organization_repository_1 = require("../../repositories/organization.repository");
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
