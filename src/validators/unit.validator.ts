import { z } from 'zod';

// Unit type constants
export const UNIT_TYPES = ['Studio', 'Apartment', 'Villa', 'Office', 'Shop', 'Warehouse', 'Parking', 'Storage'] as const;
export const UNIT_STATUSES = ['Available', 'Occupied', 'Reserved', 'Under Maintenance', 'Inactive'] as const;

// Base unit schema object
const baseUnitSchema = {
  unitNumber: z.string().min(1, 'Unit number is required').max(50),
  name: z.string().max(255).optional(),
  floor: z.coerce.number().int().min(0).optional(),
  block: z.string().max(100).optional(),
  unitType: z.enum(UNIT_TYPES, {
    message: `Unit type must be one of: ${UNIT_TYPES.join(', ')}`,
  }),
  status: z.enum(UNIT_STATUSES, {
    message: `Status must be one of: ${UNIT_STATUSES.join(', ')}`,
  }),
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().int().min(0).optional(),
  area: z.coerce.number().positive().optional(),
  areaUnit: z.string().max(10).default('sqft'),
  rentAmount: z.coerce.number().min(0).optional(),
  securityDeposit: z.coerce.number().min(0).optional(),
  availabilityDate: z.string().datetime().optional(),
  notes: z.string().max(2000).optional(),
};

// Create Unit schema
export const createUnitSchema = z.object({
  propertyId: z.string().uuid('Property ID must be a valid UUID'),
  ...baseUnitSchema,
  unitType: baseUnitSchema.unitType.default('Apartment'),
  status: baseUnitSchema.status.default('Available'),
});

// Update Unit schema (all fields optional except unitId)
export const updateUnitSchema = z.object({
  unitNumber: z.string().min(1).max(50).optional(),
  name: z.string().max(255).optional(),
  floor: z.coerce.number().int().min(0).optional(),
  block: z.string().max(100).optional(),
  unitType: z.enum(UNIT_TYPES, {
    message: `Unit type must be one of: ${UNIT_TYPES.join(', ')}`,
  }).optional(),
  status: z.enum(UNIT_STATUSES, {
    message: `Status must be one of: ${UNIT_STATUSES.join(', ')}`,
  }).optional(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().int().min(0).optional(),
  area: z.coerce.number().positive().optional(),
  areaUnit: z.string().max(10).optional(),
  rentAmount: z.coerce.number().min(0).optional(),
  securityDeposit: z.coerce.number().min(0).optional(),
  availabilityDate: z.string().datetime().optional(),
  notes: z.string().max(2000).optional(),
});

// List Units schema (query parameters)
export const listUnitsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  propertyId: z.string().uuid().optional(),
  status: z.enum(UNIT_STATUSES).optional(),
  unitType: z.enum(UNIT_TYPES).optional(),
  floor: z.coerce.number().int().min(0).optional(),
  block: z.string().max(100).optional(),
  sortBy: z.enum(['createdAt', 'unitNumber', 'status', 'unitType', 'floor']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().max(255).optional(),
});

// Unit ID schema (path parameter)
export const unitIdSchema = z.object({
  id: z.string().uuid('Unit ID must be a valid UUID'),
});

// Export inferred types
export type CreateUnitInput = z.infer<typeof createUnitSchema>;
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;
export type ListUnitsQuery = z.infer<typeof listUnitsSchema>;
export type UnitIdParams = z.infer<typeof unitIdSchema>;
