import { z } from 'zod';

// Valid property types
const PROPERTY_TYPES = ['Apartment', 'Villa', 'Commercial', 'Office', 'Retail', 'Warehouse', 'Mixed Use', 'Land'] as const;

// Valid property statuses
const PROPERTY_STATUSES = ['Draft', 'Active', 'Inactive', 'Archived'] as const;

// Base property schema with common validations
const basePropertySchema = {
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  code: z
    .string()
    .min(1, 'Code is required')
    .max(50, 'Code must be less than 50 characters')
    .regex(/^[A-Z0-9_-]+$/i, 'Code can only contain alphanumeric characters, hyphens, and underscores'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  propertyType: z.enum(PROPERTY_TYPES, {
    message: `Property type must be one of: ${PROPERTY_TYPES.join(', ')}`,
  }),
  status: z
    .enum(PROPERTY_STATUSES, {
      message: `Status must be one of: ${PROPERTY_STATUSES.join(', ')}`,
    })
    .optional()
    .default('Draft'),
  address: z.string().min(1, 'Address is required').max(255, 'Address must be less than 255 characters'),
  city: z.string().min(1, 'City is required').max(100, 'City must be less than 100 characters'),
  state: z.string().min(1, 'State is required').max(100, 'State must be less than 100 characters'),
  country: z.string().min(1, 'Country is required').max(100, 'Country must be less than 100 characters'),
  postalCode: z.string().min(1, 'Postal code is required').max(20, 'Postal code must be less than 20 characters'),
  latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90).optional(),
  longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180).optional(),
  timezone: z.string().max(100, 'Timezone must be less than 100 characters').optional(),
  totalUnits: z.number().int().min(0, 'Total units must be a positive number').optional(),
  yearBuilt: z
    .number()
    .int()
    .min(1800, 'Year built must be 1800 or later')
    .max(new Date().getFullYear(), 'Year built cannot be in the future')
    .optional(),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').optional(),
};

// Create property schema
export const createPropertySchema = z.object(basePropertySchema).strict();

export type CreatePropertyRequest = z.infer<typeof createPropertySchema>;

// Update property schema (all fields optional)
export const updatePropertySchema = z
  .object({
    name: basePropertySchema.name.optional(),
    code: basePropertySchema.code.optional(),
    description: basePropertySchema.description,
    propertyType: basePropertySchema.propertyType.optional(),
    status: basePropertySchema.status.optional(),
    address: basePropertySchema.address.optional(),
    city: basePropertySchema.city.optional(),
    state: basePropertySchema.state.optional(),
    country: basePropertySchema.country.optional(),
    postalCode: basePropertySchema.postalCode.optional(),
    latitude: basePropertySchema.latitude,
    longitude: basePropertySchema.longitude,
    timezone: basePropertySchema.timezone,
    totalUnits: basePropertySchema.totalUnits,
    yearBuilt: basePropertySchema.yearBuilt,
    notes: basePropertySchema.notes,
  })
  .strict()
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: 'At least one field must be provided for update',
  });

export type UpdatePropertyRequest = z.infer<typeof updatePropertySchema>;

// List properties query schema
export const listPropertiesSchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').optional().default(1),
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').optional().default(10),
  status: z.enum(PROPERTY_STATUSES).optional(),
  propertyType: z.enum(PROPERTY_TYPES).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  search: z.string().max(255, 'Search query must be less than 255 characters').optional(),
  sortBy: z.enum(['name', 'createdAt', 'status']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type ListPropertiesRequest = z.infer<typeof listPropertiesSchema>;

// Path parameter schemas
export const propertyIdSchema = z.object({
  id: z.string().uuid('Invalid property ID'),
});

export type PropertyIdParam = z.infer<typeof propertyIdSchema>;
