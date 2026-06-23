"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUnit = exports.updateUnit = exports.createUnit = exports.getUnit = exports.listUnits = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const listUnits = async (req, res) => {
    const units = await prisma_1.default.unit.findMany({
        where: {
            property: { organizationId: req.user.organizationId },
        },
        include: { property: true },
    });
    res.json(units);
};
exports.listUnits = listUnits;
const getUnit = async (req, res) => {
    const unitId = req.params.unitId;
    const unit = await prisma_1.default.unit.findFirst({
        where: {
            id: unitId,
            property: { organizationId: req.user.organizationId },
        },
        include: { property: true },
    });
    if (!unit) {
        return res.status(404).json({ message: 'Unit not found' });
    }
    res.json(unit);
};
exports.getUnit = getUnit;
const createUnit = async (req, res) => {
    const { propertyId, unitNumber, rentAmount } = req.body;
    const property = await prisma_1.default.property.findFirst({
        where: { id: propertyId, organizationId: req.user.organizationId },
    });
    if (!property) {
        return res.status(404).json({ message: 'Property not found' });
    }
    const unit = await prisma_1.default.unit.create({
        data: {
            propertyId,
            unitNumber,
            rentAmount,
        },
    });
    res.status(201).json(unit);
};
exports.createUnit = createUnit;
const updateUnit = async (req, res) => {
    const unitId = req.params.unitId;
    const { unitNumber, rentAmount } = req.body;
    const unit = await prisma_1.default.unit.findFirst({
        where: {
            id: unitId,
            property: { organizationId: req.user.organizationId },
        },
    });
    if (!unit) {
        return res.status(404).json({ message: 'Unit not found' });
    }
    const updated = await prisma_1.default.unit.update({
        where: { id: unitId },
        data: {
            unitNumber,
            rentAmount: rentAmount !== undefined ? rentAmount : undefined,
        },
    });
    res.json(updated);
};
exports.updateUnit = updateUnit;
const deleteUnit = async (req, res) => {
    const unitId = req.params.unitId;
    const deleted = await prisma_1.default.unit.deleteMany({
        where: {
            id: unitId,
            property: { organizationId: req.user.organizationId },
        },
    });
    if (deleted.count === 0) {
        return res.status(404).json({ message: 'Unit not found' });
    }
    res.status(204).send();
};
exports.deleteUnit = deleteUnit;
