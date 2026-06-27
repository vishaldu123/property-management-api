"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_1 = require("../utils/validation");
const property_validator_1 = require("../validators/property.validator");
const property_controller_1 = require("../controllers/property.controller");
const router = (0, express_1.Router)();
// All property routes require authentication
router.use(auth_middleware_1.requireAuth);
/**
 * @route   GET /api/v1/properties/stats
 * @desc    Get property statistics for the organization
 * @access  Private
 */
router.get('/stats', property_controller_1.getPropertyStatistics);
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
router.get('/', (0, validation_1.validate)({ query: property_validator_1.listPropertiesSchema }), property_controller_1.listProperties);
/**
 * @route   POST /api/v1/properties
 * @desc    Create a new property
 * @body    {CreatePropertyRequest} - Property data
 * @access  Private
 */
router.post('/', (0, validation_1.validate)({ body: property_validator_1.createPropertySchema }), property_controller_1.createProperty);
/**
 * @route   GET /api/v1/properties/:id
 * @desc    Get a specific property by ID
 * @param   {string} id - Property ID
 * @access  Private
 */
router.get('/:id', (0, validation_1.validate)({ params: property_validator_1.propertyIdSchema }), property_controller_1.getProperty);
/**
 * @route   PUT /api/v1/properties/:id
 * @desc    Update a property
 * @param   {string} id - Property ID
 * @body    {UpdatePropertyRequest} - Updated property data
 * @access  Private
 */
router.put('/:id', (0, validation_1.validate)({ params: property_validator_1.propertyIdSchema, body: property_validator_1.updatePropertySchema }), property_controller_1.updateProperty);
/**
 * @route   DELETE /api/v1/properties/:id
 * @desc    Soft delete a property
 * @param   {string} id - Property ID
 * @access  Private
 */
router.delete('/:id', (0, validation_1.validate)({ params: property_validator_1.propertyIdSchema }), property_controller_1.deleteProperty);
/**
 * @route   PATCH /api/v1/properties/:id/restore
 * @desc    Restore a soft-deleted property
 * @param   {string} id - Property ID
 * @access  Private
 */
router.patch('/:id/restore', (0, validation_1.validate)({ params: property_validator_1.propertyIdSchema }), property_controller_1.restoreProperty);
exports.default = router;
