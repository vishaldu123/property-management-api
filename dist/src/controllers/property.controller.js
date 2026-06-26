"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProperty = exports.updateProperty = exports.createProperty = exports.getProperty = exports.listProperties = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const response_1 = require("../shared/core/response");
const logger_1 = __importDefault(require("../utils/logger"));
const listProperties = async (req, res, next) => {
    try {
        const properties = await prisma_1.default.property.findMany({
            where: { organizationId: req.user.organizationId },
            include: { units: true },
        });
        response_1.ApiResponse.success(res, properties, 'Properties retrieved successfully');
    }
    catch (error) {
        logger_1.default.error('listProperties error', error);
        next(error);
    }
};
exports.listProperties = listProperties;
const getProperty = async (req, res, next) => {
    try {
        const propertyId = req.params.propertyId;
        const property = await prisma_1.default.property.findFirst({
            where: { id: propertyId, organizationId: req.user.organizationId },
            include: { units: true },
        });
        if (!property) {
            response_1.ApiResponse.error(res, 'Property not found', 404);
            return;
        }
        response_1.ApiResponse.success(res, property, 'Property retrieved successfully');
    }
    catch (error) {
        logger_1.default.error('getProperty error', error);
        next(error);
    }
};
exports.getProperty = getProperty;
const createProperty = async (req, res, next) => {
    try {
        const { name, address, city, state } = req.body;
        const property = await prisma_1.default.property.create({
            data: {
                name,
                address,
                city,
                state,
                organizationId: req.user.organizationId,
            },
        });
        response_1.ApiResponse.created(res, property, 'Property created successfully');
    }
    catch (error) {
        logger_1.default.error('createProperty error', error);
        next(error);
    }
};
exports.createProperty = createProperty;
const updateProperty = async (req, res, next) => {
    try {
        const propertyId = req.params.propertyId;
        const { name, address, city, state } = req.body;
        const property = await prisma_1.default.property.updateMany({
            where: { id: propertyId, organizationId: req.user.organizationId },
            data: { name, address, city, state },
        });
        if (property.count === 0) {
            response_1.ApiResponse.error(res, 'Property not found', 404);
            return;
        }
        const updated = await prisma_1.default.property.findUnique({ where: { id: propertyId } });
        response_1.ApiResponse.success(res, updated, 'Property updated successfully');
    }
    catch (error) {
        logger_1.default.error('updateProperty error', error);
        next(error);
    }
};
exports.updateProperty = updateProperty;
const deleteProperty = async (req, res, next) => {
    try {
        const propertyId = req.params.propertyId;
        const property = await prisma_1.default.property.deleteMany({
            where: { id: propertyId, organizationId: req.user.organizationId },
        });
        if (property.count === 0) {
            response_1.ApiResponse.error(res, 'Property not found', 404);
            return;
        }
        response_1.ApiResponse.success(res, null, 'Property deleted successfully', 204);
    }
    catch (error) {
        logger_1.default.error('deleteProperty error', error);
        next(error);
    }
};
exports.deleteProperty = deleteProperty;
