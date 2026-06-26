"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUnit = exports.updateUnit = exports.createUnit = exports.getUnit = exports.listUnits = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const response_1 = require("../shared/core/response");
const logger_1 = __importDefault(require("../utils/logger"));
const listUnits = async (req, res, next) => {
    try {
        const units = await prisma_1.default.unit.findMany({
            where: {
                property: { organizationId: req.user.organizationId },
            },
            include: { property: true },
        });
        response_1.ApiResponse.success(res, units, 'Units retrieved successfully');
    }
    catch (error) {
        logger_1.default.error('listUnits error', error);
        next(error);
    }
};
exports.listUnits = listUnits;
const getUnit = async (req, res, next) => {
    try {
        const unitId = req.params.unitId;
        const unit = await prisma_1.default.unit.findFirst({
            where: {
                id: unitId,
                property: { organizationId: req.user.organizationId },
            },
            include: { property: true },
        });
        if (!unit) {
            response_1.ApiResponse.error(res, 'Unit not found', 404);
            return;
        }
        response_1.ApiResponse.success(res, unit, 'Unit retrieved successfully');
    }
    catch (error) {
        logger_1.default.error('getUnit error', error);
        next(error);
    }
};
exports.getUnit = getUnit;
const createUnit = async (req, res, next) => {
    try {
        const { propertyId, unitNumber, rentAmount } = req.body;
        const property = await prisma_1.default.property.findFirst({
            where: { id: propertyId, organizationId: req.user.organizationId },
        });
        if (!property) {
            response_1.ApiResponse.error(res, 'Property not found', 404);
            return;
        }
        const unit = await prisma_1.default.unit.create({
            data: {
                propertyId,
                unitNumber,
                rentAmount,
            },
        });
        response_1.ApiResponse.created(res, unit, 'Unit created successfully');
    }
    catch (error) {
        logger_1.default.error('createUnit error', error);
        next(error);
    }
};
exports.createUnit = createUnit;
const updateUnit = async (req, res, next) => {
    try {
        const unitId = req.params.unitId;
        const { unitNumber, rentAmount } = req.body;
        const unit = await prisma_1.default.unit.findFirst({
            where: {
                id: unitId,
                property: { organizationId: req.user.organizationId },
            },
        });
        if (!unit) {
            response_1.ApiResponse.error(res, 'Unit not found', 404);
            return;
        }
        const updated = await prisma_1.default.unit.update({
            where: { id: unitId },
            data: {
                unitNumber,
                rentAmount: rentAmount !== undefined ? rentAmount : undefined,
            },
        });
        response_1.ApiResponse.success(res, updated, 'Unit updated successfully');
    }
    catch (error) {
        logger_1.default.error('updateUnit error', error);
        next(error);
    }
};
exports.updateUnit = updateUnit;
const deleteUnit = async (req, res, next) => {
    try {
        const unitId = req.params.unitId;
        const deleted = await prisma_1.default.unit.deleteMany({
            where: {
                id: unitId,
                property: { organizationId: req.user.organizationId },
            },
        });
        if (deleted.count === 0) {
            response_1.ApiResponse.error(res, 'Unit not found', 404);
            return;
        }
        response_1.ApiResponse.success(res, null, 'Unit deleted successfully', 204);
    }
    catch (error) {
        logger_1.default.error('deleteUnit error', error);
        next(error);
    }
};
exports.deleteUnit = deleteUnit;
