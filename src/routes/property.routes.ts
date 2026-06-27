import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../utils/validation';
import {
  createPropertySchema,
  updatePropertySchema,
  listPropertiesSchema,
  propertyIdSchema,
} from '../validators/property.validator';
import {
  createProperty,
  deleteProperty,
  getProperty,
  listProperties,
  updateProperty,
  restoreProperty,
  getPropertyStatistics,
} from '../controllers/property.controller';

const router = Router();

// All property routes require authentication
router.use(requireAuth);

/**
 * @route   GET /api/v1/properties/stats
 * @desc    Get property statistics for the organization
 * @access  Private
 */
router.get('/stats', getPropertyStatistics);

/**
 * @route   GET /api/v1/properties
 * @desc    List all properties with pagination, filtering, and search
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Items per page (default: 10)
 * @query   {string} status - Filter by status (Draft, Active, Inactive, Archived)
 * @query   {string} propertyType - Filter by property type
 * @query   {string} city - Filter by city
 * @query   {string} country - Filter by country
 * @query   {string} search - Search in name, address, city, code
 * @query   {string} sortBy - Sort field (name, createdAt, status)
 * @query   {string} sortOrder - Sort order (asc, desc)
 * @access  Private
 */
router.get('/', validate({ query: listPropertiesSchema }), listProperties);

/**
 * @route   POST /api/v1/properties
 * @desc    Create a new property
 * @body    {CreatePropertyRequest} - Property data
 * @access  Private
 */
router.post('/', validate({ body: createPropertySchema }), createProperty);

/**
 * @route   GET /api/v1/properties/:id
 * @desc    Get a specific property by ID
 * @param   {string} id - Property ID
 * @access  Private
 */
router.get('/:id', validate({ params: propertyIdSchema }), getProperty);

/**
 * @route   PUT /api/v1/properties/:id
 * @desc    Update a property
 * @param   {string} id - Property ID
 * @body    {UpdatePropertyRequest} - Updated property data
 * @access  Private
 */
router.put('/:id', validate({ params: propertyIdSchema, body: updatePropertySchema }), updateProperty);

/**
 * @route   DELETE /api/v1/properties/:id
 * @desc    Soft delete a property
 * @param   {string} id - Property ID
 * @access  Private
 */
router.delete('/:id', validate({ params: propertyIdSchema }), deleteProperty);

/**
 * @route   PATCH /api/v1/properties/:id/restore
 * @desc    Restore a soft-deleted property
 * @param   {string} id - Property ID
 * @access  Private
 */
router.patch('/:id/restore', validate({ params: propertyIdSchema }), restoreProperty);

export default router;
