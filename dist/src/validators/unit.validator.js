"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unitIdSchema = exports.listUnitsSchema = exports.updateUnitSchema = exports.createUnitSchema = exports.UNIT_STATUSES = exports.UNIT_TYPES = void 0;
const zod_1 = require("zod");
// Unit type constants
exports.UNIT_TYPES = ['Studio', 'Apartment', 'Villa', 'Office', 'Shop', 'Warehouse', 'Parking', 'Storage'];
exports.UNIT_STATUSES = ['Available', 'Occupied', 'Reserved', 'Under Maintenance', 'Inactive'];
// Base unit schema object
const baseUnitSchema = {
    unitNumber: zod_1.z.string().min(1, 'Unit number is required').max(50),
    name: zod_1.z.string().max(255).optional(),
    floor: zod_1.z.coerce.number().int().min(0).optional(),
    block: zod_1.z.string().max(100).optional(),
    unitType: zod_1.z.enum(exports.UNIT_TYPES, {
        message: `Unit type must be one of: ${exports.UNIT_TYPES.join(', ')}`,
    }),
    status: zod_1.z.enum(exports.UNIT_STATUSES, {
        message: `Status must be one of: ${exports.UNIT_STATUSES.join(', ')}`,
    }),
    bedrooms: zod_1.z.coerce.number().int().min(0).optional(),
    bathrooms: zod_1.z.coerce.number().int().min(0).optional(),
    area: zod_1.z.coerce.number().positive().optional(),
    areaUnit: zod_1.z.string().max(10).default('sqft'),
    rentAmount: zod_1.z.coerce.number().min(0).optional(),
    securityDeposit: zod_1.z.coerce.number().min(0).optional(),
    availabilityDate: zod_1.z.string().datetime().optional(),
    notes: zod_1.z.string().max(2000).optional(),
};
// Create Unit schema
exports.createUnitSchema = zod_1.z.object({
    propertyId: zod_1.z.string().uuid('Property ID must be a valid UUID'),
    ...baseUnitSchema,
    unitType: baseUnitSchema.unitType.default('Apartment'),
    status: baseUnitSchema.status.default('Available'),
});
// Update Unit schema (all fields optional except unitId)
exports.updateUnitSchema = zod_1.z.object({
    unitNumber: zod_1.z.string().min(1).max(50).optional(),
    name: zod_1.z.string().max(255).optional(),
    floor: zod_1.z.coerce.number().int().min(0).optional(),
    block: zod_1.z.string().max(100).optional(),
    unitType: zod_1.z.enum(exports.UNIT_TYPES, {
        message: `Unit type must be one of: ${exports.UNIT_TYPES.join(', ')}`,
    }).optional(),
    status: zod_1.z.enum(exports.UNIT_STATUSES, {
        message: `Status must be one of: ${exports.UNIT_STATUSES.join(', ')}`,
    }).optional(),
    bedrooms: zod_1.z.coerce.number().int().min(0).optional(),
    bathrooms: zod_1.z.coerce.number().int().min(0).optional(),
    area: zod_1.z.coerce.number().positive().optional(),
    areaUnit: zod_1.z.string().max(10).optional(),
    rentAmount: zod_1.z.coerce.number().min(0).optional(),
    securityDeposit: zod_1.z.coerce.number().min(0).optional(),
    availabilityDate: zod_1.z.string().datetime().optional(),
    notes: zod_1.z.string().max(2000).optional(),
});
// List Units schema (query parameters)
exports.listUnitsSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    propertyId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(exports.UNIT_STATUSES).optional(),
    unitType: zod_1.z.enum(exports.UNIT_TYPES).optional(),
    floor: zod_1.z.coerce.number().int().min(0).optional(),
    block: zod_1.z.string().max(100).optional(),
    sortBy: zod_1.z.enum(['createdAt', 'unitNumber', 'status', 'unitType', 'floor']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
    search: zod_1.z.string().max(255).optional(),
});
// Unit ID schema (path parameter)
exports.unitIdSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Unit ID must be a valid UUID'),
});
