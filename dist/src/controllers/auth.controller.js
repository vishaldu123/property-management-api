"use strict";
/**
 * Authentication Controller
 * Handles user registration, login, logout, password reset, and token refresh
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.changePassword = exports.resetPassword = exports.forgotPassword = exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const auth_service_1 = require("../services/auth.service");
const logger_1 = __importDefault(require("../utils/logger"));
const response_1 = require("../shared/core/response");
const auth_validators_1 = require("../validators/auth.validators");
const brute_force_middleware_1 = require("../middleware/brute-force.middleware");
/**
 * Register a new user and organization
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
    try {
        const validation = auth_validators_1.registerSchema.safeParse(req.body);
        if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        const result = await auth_service_1.authService.register(validation.data);
        response_1.ApiResponse.created(res, result, 'User and organization registered successfully');
    }
    catch (error) {
        logger_1.default.error('Register endpoint error', error);
        next(error);
    }
};
exports.register = register;
/**
 * Login a user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
    try {
        const validation = auth_validators_1.loginSchema.safeParse(req.body);
        if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        const result = await auth_service_1.authService.login(validation.data);
        // Record successful login to clear brute-force attempts
        const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
        brute_force_middleware_1.bruteForceProtection.recordSuccessfulLogin(clientIp, validation.data.email);
        response_1.ApiResponse.success(res, result, 'Login successful');
    }
    catch (error) {
        logger_1.default.error('Login endpoint error', error);
        // Record failed login attempt for brute-force protection
        if (req.body?.email) {
            const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
            const { isLocked } = brute_force_middleware_1.bruteForceProtection.recordFailedAttempt(clientIp, req.body.email);
            if (isLocked) {
                res.status(429).json({
                    success: false,
                    message: 'Too many failed login attempts. Please try again later.',
                });
                return;
            }
        }
        next(error);
    }
};
exports.login = login;
/**
 * Refresh access token
 * POST /api/auth/refresh-token
 */
const refreshToken = async (req, res, next) => {
    try {
        const validation = auth_validators_1.refreshTokenSchema.safeParse(req.body);
        if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors);
            return;
        }
        const result = await auth_service_1.authService.refreshToken(validation.data.refreshToken);
        response_1.ApiResponse.success(res, result, 'Token refreshed successfully');
    }
    catch (error) {
        logger_1.default.error('Refresh token endpoint error', error);
        next(error);
    }
};
exports.refreshToken = refreshToken;
/**
 * Logout a user
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
    try {
        const validation = auth_validators_1.refreshTokenSchema.safeParse(req.body);
        if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors);
            return;
        }
        await auth_service_1.authService.logout(validation.data.refreshToken);
        response_1.ApiResponse.success(res, null, 'Logged out successfully');
    }
    catch (error) {
        logger_1.default.error('Logout endpoint error', error);
        next(error);
    }
};
exports.logout = logout;
/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res, next) => {
    try {
        const validation = auth_validators_1.forgotPasswordSchema.safeParse(req.body);
        if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors);
            return;
        }
        const result = await auth_service_1.authService.forgotPassword(validation.data.email);
        response_1.ApiResponse.success(res, result, 'Password reset email sent');
    }
    catch (error) {
        logger_1.default.error('Forgot password endpoint error', error);
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res, next) => {
    try {
        const validation = auth_validators_1.resetPasswordSchema.safeParse(req.body);
        if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors);
            return;
        }
        const result = await auth_service_1.authService.resetPassword(validation.data.token, validation.data.password);
        response_1.ApiResponse.success(res, result, 'Password reset successfully');
    }
    catch (error) {
        logger_1.default.error('Reset password endpoint error', error);
        next(error);
    }
};
exports.resetPassword = resetPassword;
/**
 * Change password (authenticated user)
 * POST /api/auth/change-password
 */
const changePassword = async (req, res, next) => {
    try {
        if (!req.user) {
            response_1.ApiResponse.error(res, 'Unauthorized', 401);
            return;
        }
        const validation = auth_validators_1.changePasswordSchema.safeParse(req.body);
        if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors);
            return;
        }
        const result = await auth_service_1.authService.changePassword(req.user.userId, validation.data.currentPassword, validation.data.newPassword);
        response_1.ApiResponse.success(res, result, 'Password changed successfully');
    }
    catch (error) {
        logger_1.default.error('Change password endpoint error', error);
        next(error);
    }
};
exports.changePassword = changePassword;
/**
 * Get current user
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res, next) => {
    try {
        if (!req.user) {
            response_1.ApiResponse.error(res, 'Unauthorized', 401);
            return;
        }
        const result = await auth_service_1.authService.getCurrentUser(req.user.userId, req.user.organizationId);
        response_1.ApiResponse.success(res, result, 'User retrieved successfully');
    }
    catch (error) {
        logger_1.default.error('Get current user endpoint error', error);
        next(error);
    }
};
exports.getCurrentUser = getCurrentUser;
