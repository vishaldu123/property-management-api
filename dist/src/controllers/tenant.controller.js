"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTenant = exports.listTenants = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const response_1 = require("../shared/core/response");
const logger_1 = __importDefault(require("../utils/logger"));
const listTenants = async (req, res, next) => {
    try {
        const tenants = await prisma_1.default.tenant.findMany({
            where: { organizationId: req.user.organizationId },
        });
        response_1.ApiResponse.success(res, tenants, 'Tenants retrieved successfully');
    }
    catch (error) {
        logger_1.default.error('listTenants error', error);
        next(error);
    }
};
exports.listTenants = listTenants;
const createTenant = async (req, res, next) => {
    try {
        const { name, email, phone } = req.body;
        const tenant = await prisma_1.default.tenant.create({
            data: {
                name,
                email,
                phone,
                organizationId: req.user.organizationId,
            },
        });
        response_1.ApiResponse.created(res, tenant, 'Tenant created successfully');
    }
    catch (error) {
        logger_1.default.error('createTenant error', error);
        next(error);
    }
};
exports.createTenant = createTenant;
