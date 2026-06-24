"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTenantSchema = void 0;
const zod_1 = require("zod");
exports.createTenantSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    email: zod_1.z.string().email('Invalid email format').optional().nullable(),
    phone: zod_1.z.string().min(1, 'Phone is required'),
    address: zod_1.z.string().optional().nullable(),
});
