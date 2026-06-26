"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationRepository = exports.OrganizationRepository = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const repository_1 = require("../shared/core/repository");
class OrganizationRepository extends repository_1.BaseRepository {
    constructor() {
        super(prisma_1.default, 'organization');
    }
    async findBySlug(slug) {
        return prisma_1.default.organization.findUnique({
            where: { slug },
        });
    }
    async findByEmail(email) {
        return prisma_1.default.organization.findUnique({
            where: { email },
        });
    }
    async findByIdAndOrganizationId(id, organizationId) {
        if (id !== organizationId) {
            return null;
        }
        return prisma_1.default.organization.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });
    }
    async paginateScoped(pagination, organizationId, where) {
        const scopedWhere = {
            ...where,
            id: organizationId,
        };
        return this.paginate(pagination, scopedWhere);
    }
}
exports.OrganizationRepository = OrganizationRepository;
// Export singleton instance
exports.organizationRepository = new OrganizationRepository();
