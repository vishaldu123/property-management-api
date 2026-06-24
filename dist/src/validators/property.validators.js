"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyIdParamSchema = exports.updatePropertySchema = exports.createPropertySchema = void 0;
const zod_1 = require("zod");
exports.createPropertySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    address: zod_1.z.string().min(1, 'Address is required'),
    city: zod_1.z.string().min(1, 'City is required'),
    state: zod_1.z.string().min(1, 'State is required'),
    country: zod_1.z.string().optional(),
    postalCode: zod_1.z.string().optional(),
});
exports.updatePropertySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').optional(),
    address: zod_1.z.string().min(1, 'Address is required').optional(),
    city: zod_1.z.string().min(1, 'City is required').optional(),
    state: zod_1.z.string().min(1, 'State is required').optional(),
    country: zod_1.z.string().optional(),
    postalCode: zod_1.z.string().optional(),
});
exports.propertyIdParamSchema = zod_1.z.object({
    propertyId: zod_1.z.string().uuid('Property ID must be a valid UUID'),
});
