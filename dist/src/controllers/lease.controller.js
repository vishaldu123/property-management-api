"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLease = exports.updateLease = exports.createLease = exports.getLease = exports.listLeases = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const listLeases = async (req, res) => {
    const leases = await prisma_1.default.lease.findMany({
        where: { unit: { property: { organizationId: req.user.organizationId } } },
        include: { unit: true, tenant: true, payments: true },
    });
    res.json(leases);
};
exports.listLeases = listLeases;
const getLease = async (req, res) => {
    const leaseId = req.params.leaseId;
    const lease = await prisma_1.default.lease.findFirst({
        where: { id: leaseId, unit: { property: { organizationId: req.user.organizationId } } },
        include: { unit: true, tenant: true, payments: true },
    });
    if (!lease) {
        return res.status(404).json({ message: 'Lease not found' });
    }
    res.json(lease);
};
exports.getLease = getLease;
const createLease = async (req, res) => {
    const { unitId, tenantId, startDate, endDate, monthlyRent } = req.body;
    const unit = await prisma_1.default.unit.findFirst({
        where: { id: unitId, property: { organizationId: req.user.organizationId } },
    });
    if (!unit) {
        return res.status(404).json({ message: 'Unit not found' });
    }
    const tenant = await prisma_1.default.tenant.findFirst({
        where: { id: tenantId, organizationId: req.user.organizationId },
    });
    if (!tenant) {
        return res.status(404).json({ message: 'Tenant not found' });
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
    res.status(201).json(lease);
};
exports.createLease = createLease;
const updateLease = async (req, res) => {
    const leaseId = req.params.leaseId;
    const { startDate, endDate, monthlyRent } = req.body;
    const lease = await prisma_1.default.lease.findFirst({
        where: { id: leaseId, unit: { property: { organizationId: req.user.organizationId } } },
    });
    if (!lease) {
        return res.status(404).json({ message: 'Lease not found' });
    }
    const updated = await prisma_1.default.lease.update({
        where: { id: leaseId },
        data: {
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            monthlyRent: monthlyRent !== undefined ? monthlyRent : undefined,
        },
    });
    res.json(updated);
};
exports.updateLease = updateLease;
const deleteLease = async (req, res) => {
    const leaseId = req.params.leaseId;
    const deleted = await prisma_1.default.lease.deleteMany({
        where: { id: leaseId, unit: { property: { organizationId: req.user.organizationId } } },
    });
    if (deleted.count === 0) {
        return res.status(404).json({ message: 'Lease not found' });
    }
    res.status(204).send();
};
exports.deleteLease = deleteLease;
