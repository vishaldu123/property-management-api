import { z } from 'zod';

export const createPropertySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

export const updatePropertySchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  address: z.string().min(1, 'Address is required').optional(),
  city: z.string().min(1, 'City is required').optional(),
  state: z.string().min(1, 'State is required').optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

export const propertyIdParamSchema = z.object({
  propertyId: z.string().uuid('Property ID must be a valid UUID'),
});