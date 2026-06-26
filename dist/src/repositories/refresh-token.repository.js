"use strict";
/**
 * Refresh Token Repository
 * Handles all refresh token operations
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenRepository = exports.RefreshTokenRepository = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const logger_1 = __importDefault(require("../utils/logger"));
class RefreshTokenRepository {
    async create(input) {
        try {
            const refreshToken = await prisma_1.default.refreshToken.create({
                data: input,
            });
            logger_1.default.debug('Refresh token created', { userId: input.userId });
            return refreshToken;
        }
        catch (error) {
            logger_1.default.error('Failed to create refresh token', error);
            throw error;
        }
    }
    async findByToken(token) {
        try {
            return await prisma_1.default.refreshToken.findUnique({
                where: { token },
                include: { user: true },
            });
        }
        catch (error) {
            logger_1.default.error('Failed to find refresh token', error);
            throw error;
        }
    }
    async findValidByToken(token) {
        try {
            return await prisma_1.default.refreshToken.findUnique({
                where: { token },
                include: { user: true },
            });
        }
        catch (error) {
            logger_1.default.error('Failed to find valid refresh token', error);
            throw error;
        }
    }
    async revoke(token) {
        try {
            const refreshToken = await prisma_1.default.refreshToken.update({
                where: { token },
                data: { isRevoked: true },
            });
            logger_1.default.debug('Refresh token revoked');
            return refreshToken;
        }
        catch (error) {
            logger_1.default.error('Failed to revoke refresh token', error);
            throw error;
        }
    }
    async revokeByUserId(userId) {
        try {
            const result = await prisma_1.default.refreshToken.updateMany({
                where: { userId },
                data: { isRevoked: true },
            });
            logger_1.default.debug('Refresh tokens revoked for user', { userId });
            return result;
        }
        catch (error) {
            logger_1.default.error('Failed to revoke refresh tokens', error);
            throw error;
        }
    }
    async deleteExpired() {
        try {
            const result = await prisma_1.default.refreshToken.deleteMany({
                where: {
                    expiresAt: {
                        lt: new Date(),
                    },
                },
            });
            logger_1.default.info('Expired refresh tokens deleted', { count: result.count });
            return result;
        }
        catch (error) {
            logger_1.default.error('Failed to delete expired refresh tokens', error);
            throw error;
        }
    }
}
exports.RefreshTokenRepository = RefreshTokenRepository;
exports.refreshTokenRepository = new RefreshTokenRepository();
