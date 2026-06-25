"use strict";
/**
 * Organization Repository
 * Data access layer for Organization model
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationRepository = exports.OrganizationRepository = void 0;
const base_repository_1 = require("./base.repository");
const prisma_1 = __importDefault(require("../config/prisma"));
const logger_1 = __importDefault(require("../utils/logger"));
class OrganizationRepository extends base_repository_1.BaseRepository {
    model = prisma_1.default.organization;
    constructor() {
        super('Organization');
    }
    async findBySlug(slug) {
        try {
            logger_1.default.debug('Finding organization by slug', { slug });
            return await this.model.findUnique({
                where: { slug },
            });
        }
        catch (error) {
            logger_1.default.error('Failed to find organization by slug', error, { slug });
            throw error;
        }
    }
    async findWithUsers(id) {
        try {
            logger_1.default.debug('Finding organization with users', { id });
            return await this.model.findUnique({
                where: { id },
                include: {
                    users: {
                        include: {
                            user: true,
                        },
                    },
                },
            });
        }
        catch (error) {
            logger_1.default.error('Failed to find organization with users', error, { id });
            throw error;
        }
    }
}
exports.OrganizationRepository = OrganizationRepository;
// Export singleton instance
exports.organizationRepository = new OrganizationRepository();
