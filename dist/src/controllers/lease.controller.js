"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLease = exports.updateLease = exports.createLease = exports.getLease = exports.listLeases = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const response_1 = require("../shared/core/response");
const logger_1 = __importDefault(require("../utils/logger"));
const listLeases = async (req, res, next) => {
    try {
        const leases = await prisma_1.default.lease.findMany({
            where: { unit: { property: { organizationId: req.user.organizationId } } },
            include: { unit: true, tenant: true, payments: true },
        });
        response_1.ApiResponse.success(res, leases, 'Leases retrieved successfully');
    }
    catch (error) {
        logger_1.default.error('listLeases error', error);
        next(error);
    }
};
exports.listLeases = listLeases;
const getLease = async (req, res, next) => {
    try {
        const leaseId = req.params.leaseId;
        const lease = await prisma_1.default.lease.findFirst({
            where: { id: leaseId, unit: { property: { organizationId: req.user.organizationId } } },
            include: { unit: true, tenant: true, payments: true },
        });
        if (!lease) {
            response_1.ApiResponse.error(res, 'Lease not found', 404);
            return;
        }
        response_1.ApiResponse.success(res, lease, 'Lease retrieved successfully');
    }
    catch (error) {
        logger_1.default.error('getLease error', error);
        next(error);
    }
};
exports.getLease = getLease;
const createLease = async (req, res, next) => {
    try {
        const { unitId, tenantId, startDate, endDate, monthlyRent } = req.body;
        const unit = await prisma_1.default.unit.findFirst({
            where: { id: unitId, property: { organizationId: req.user.organizationId } },
        });
        if (!unit) {
            response_1.ApiResponse.error(res, 'Unit not found', 404);
            return;
        }
        const tenant = await prisma_1.default.tenant.findFirst({
            where: { id: tenantId, organizationId: req.user.organizationId },
        });
        if (!tenant) {
            response_1.ApiResponse.error(res, 'Tenant not found', 404);
            return;
        }
        const lease = await prisma_1.default.lease.create({
            data: {
                unit: { connect: { id: unitId } },
                tenant: { connect: { id: tenantId } },
                Organization: { connect: { id: req.user.organizationId } },
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                monthlyRent,
            },
        });
        response_1.ApiResponse.created(res, lease, 'Lease created successfully');
    }
    catch (error) {
        logger_1.default.error('createLease error', error);
        next(error);
    }
};
exports.createLease = createLease;
const updateLease = async (req, res, next) => {
    try {
        const leaseId = req.params.leaseId;
        const { startDate, endDate, monthlyRent } = req.body;
        const lease = await prisma_1.default.lease.findFirst({
            where: { id: leaseId, unit: { property: { organizationId: req.user.organizationId } } },
        });
        if (!lease) {
            response_1.ApiResponse.error(res, 'Lease not found', 404);
            return;
        }
        const updated = await prisma_1.default.lease.update({
            where: { id: leaseId },
            data: {
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                monthlyRent: monthlyRent !== undefined ? monthlyRent : undefined,
            },
        });
        response_1.ApiResponse.success(res, updated, 'Lease updated successfully');
    }
    catch (error) {
        logger_1.default.error('updateLease error', error);
        next(error);
    }
};
exports.updateLease = updateLease;
const deleteLease = async (req, res, next) => {
    try {
        const leaseId = req.params.leaseId;
        const deleted = await prisma_1.default.lease.deleteMany({
            where: { id: leaseId, unit: { property: { organizationId: req.user.organizationId } } },
        });
        if (deleted.count === 0) {
            response_1.ApiResponse.error(res, 'Lease not found', 404);
            return;
        }
        response_1.ApiResponse.success(res, null, 'Lease deleted successfully', 204);
    }
    catch (error) {
        logger_1.default.error('deleteLease error', error);
        next(error);
    }
};
exports.deleteLease = deleteLease;
