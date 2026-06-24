"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unitIdParamSchema = exports.updateUnitSchema = exports.createUnitSchema = void 0;
const zod_1 = require("zod");
exports.createUnitSchema = zod_1.z.object({
    propertyId: zod_1.z.string().uuid('Property ID must be a valid UUID'),
    unitNumber: zod_1.z.string().min(1, 'Unit number is required'),
    rentAmount: zod_1.z.number().positive('Rent amount must be positive'),
    areaSqFt: zod_1.z.number().positive('Area must be positive').optional(),
    bedrooms: zod_1.z.number().int().min(0, 'Bedrooms must be >= 0').optional(),
    bathrooms: zod_1.z.number().int().min(0, 'Bathrooms must be >= 0').optional(),
});
exports.updateUnitSchema = zod_1.z.object({
    unitNumber: zod_1.z.string().min(1, 'Unit number is required').optional(),
    rentAmount: zod_1.z.number().positive('Rent amount must be positive').optional(),
    areaSqFt: zod_1.z.number().positive('Area must be positive').optional(),
    bedrooms: zod_1.z.number().int().min(0, 'Bedrooms must be >= 0').optional(),
    bathrooms: zod_1.z.number().int().min(0, 'Bathrooms must be >= 0').optional(),
});
exports.unitIdParamSchema = zod_1.z.object({
    unitId: zod_1.z.string().uuid('Unit ID must be a valid UUID'),
});
