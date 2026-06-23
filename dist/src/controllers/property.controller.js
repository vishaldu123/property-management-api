"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProperty = exports.updateProperty = exports.createProperty = exports.getProperty = exports.listProperties = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const listProperties = async (req, res) => {
    const properties = await prisma_1.default.property.findMany({
        where: { organizationId: req.user.organizationId },
        include: { units: true },
    });
    res.json(properties);
};
exports.listProperties = listProperties;
const getProperty = async (req, res) => {
    const propertyId = req.params.propertyId;
    const property = await prisma_1.default.property.findFirst({
        where: { id: propertyId, organizationId: req.user.organizationId },
        include: { units: true },
    });
    if (!property) {
        return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
};
exports.getProperty = getProperty;
const createProperty = async (req, res) => {
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
    res.status(201).json(property);
};
exports.createProperty = createProperty;
const updateProperty = async (req, res) => {
    const propertyId = req.params.propertyId;
    const { name, address, city, state } = req.body;
    const property = await prisma_1.default.property.updateMany({
        where: { id: propertyId, organizationId: req.user.organizationId },
        data: { name, address, city, state },
    });
    if (property.count === 0) {
        return res.status(404).json({ message: 'Property not found' });
    }
    const updated = await prisma_1.default.property.findUnique({ where: { id: propertyId } });
    res.json(updated);
};
exports.updateProperty = updateProperty;
const deleteProperty = async (req, res) => {
    const propertyId = req.params.propertyId;
    const property = await prisma_1.default.property.deleteMany({
        where: { id: propertyId, organizationId: req.user.organizationId },
    });
    if (property.count === 0) {
        return res.status(404).json({ message: 'Property not found' });
    }
    res.status(204).send();
};
exports.deleteProperty = deleteProperty;
