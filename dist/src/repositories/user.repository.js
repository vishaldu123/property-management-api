"use strict";
/**
 * User Repository
 * Data access layer for User model
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const base_repository_1 = require("./base.repository");
const prisma_1 = __importDefault(require("../config/prisma"));
const logger_1 = __importDefault(require("../utils/logger"));
class UserRepository extends base_repository_1.BaseRepository {
    model = prisma_1.default.user;
    constructor() {
        super('User');
    }
    async findByEmail(email) {
        try {
            logger_1.default.debug('Finding user by email', { email });
            return await this.model.findUnique({
                where: { email },
            });
        }
        catch (error) {
            logger_1.default.error('Failed to find user by email', error, { email });
            throw error;
        }
    }
    async findWithMemberships(id) {
        try {
            logger_1.default.debug('Finding user with memberships', { id });
            return await this.model.findUnique({
                where: { id },
                include: {
                    memberships: {
                        include: {
                            organization: true,
                        },
                    },
                },
            });
        }
        catch (error) {
            logger_1.default.error('Failed to find user with memberships', error, { id });
            throw error;
        }
    }
}
exports.UserRepository = UserRepository;
// Export singleton instance
exports.userRepository = new UserRepository();
