"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTenant = exports.listTenants = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const listTenants = async (req, res) => {
    const tenants = await prisma_1.default.tenant.findMany({
        where: { organizationId: req.user.organizationId },
    });
    res.json(tenants);
};
exports.listTenants = listTenants;
const createTenant = async (req, res) => {
    const { name, email, phone } = req.body;
    const tenant = await prisma_1.default.tenant.create({
        data: {
            name,
            email,
            phone,
            organizationId: req.user.organizationId,
        },
    });
    res.status(201).json(tenant);
};
exports.createTenant = createTenant;
