"use strict";
/**
 * Password Reset Token Repository
 * Handles all password reset token operations
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordResetTokenRepository = exports.PasswordResetTokenRepository = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const logger_1 = __importDefault(require("../utils/logger"));
class PasswordResetTokenRepository {
    async create(input) {
        try {
            const resetToken = await prisma_1.default.passwordResetToken.create({
                data: input,
            });
            logger_1.default.debug('Password reset token created', { userId: input.userId });
            return resetToken;
        }
        catch (error) {
            logger_1.default.error('Failed to create password reset token', error);
            throw error;
        }
    }
    async findByToken(token) {
        try {
            return await prisma_1.default.passwordResetToken.findUnique({
                where: { token },
                include: { user: true },
            });
        }
        catch (error) {
            logger_1.default.error('Failed to find password reset token', error);
            throw error;
        }
    }
    async findValidByToken(token) {
        try {
            return await prisma_1.default.passwordResetToken.findUnique({
                where: { token },
            });
        }
        catch (error) {
            logger_1.default.error('Failed to find valid password reset token', error);
            throw error;
        }
    }
    async markAsUsed(token) {
        try {
            const resetToken = await prisma_1.default.passwordResetToken.update({
                where: { token },
                data: { usedAt: new Date() },
            });
            logger_1.default.debug('Password reset token marked as used');
            return resetToken;
        }
        catch (error) {
            logger_1.default.error('Failed to mark password reset token as used', error);
            throw error;
        }
    }
    async deleteExpired() {
        try {
            const result = await prisma_1.default.passwordResetToken.deleteMany({
                where: {
                    expiresAt: {
                        lt: new Date(),
                    },
                },
            });
            logger_1.default.info('Expired password reset tokens deleted', { count: result.count });
            return result;
        }
        catch (error) {
            logger_1.default.error('Failed to delete expired password reset tokens', error);
            throw error;
        }
    }
}
exports.PasswordResetTokenRepository = PasswordResetTokenRepository;
exports.passwordResetTokenRepository = new PasswordResetTokenRepository();
