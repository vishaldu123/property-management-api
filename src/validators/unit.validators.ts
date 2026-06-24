import { z } from 'zod';

export const createUnitSchema = z.object({
  propertyId: z.string().uuid('Property ID must be a valid UUID'),
  unitNumber: z.string().min(1, 'Unit number is required'),
  rentAmount: z.number().positive('Rent amount must be positive'),
  areaSqFt: z.number().positive('Area must be positive').optional(),
  bedrooms: z.number().int().min(0, 'Bedrooms must be >= 0').optional(),
  bathrooms: z.number().int().min(0, 'Bathrooms must be >= 0').optional(),
});

export const updateUnitSchema = z.object({
  unitNumber: z.string().min(1, 'Unit number is required').optional(),
  rentAmount: z.number().positive('Rent amount must be positive').optional(),
  areaSqFt: z.number().positive('Area must be positive').optional(),
  bedrooms: z.number().int().min(0, 'Bedrooms must be >= 0').optional(),
  bathrooms: z.number().int().min(0, 'Bathrooms must be >= 0').optional(),
});

export const unitIdParamSchema = z.object({
  unitId: z.string().uuid('Unit ID must be a valid UUID'),
});