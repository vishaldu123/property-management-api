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
const errors_1 = require("../utils/errors");
const auth_validators_1 = require("../validators/auth.validators");
/**
 * Register a new user and organization
 * POST /api/auth/register
 */
const register = async (req, res) => {
    try {
        const validation = auth_validators_1.registerSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                message: 'Validation failed',
                errors: validation.error.flatten().fieldErrors,
            });
            return;
        }
        const result = await auth_service_1.authService.register(validation.data);
        res.status(201).json(result);
    }
    catch (error) {
        logger_1.default.error('Register endpoint error', error);
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};
exports.register = register;
/**
 * Login a user
 * POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const validation = auth_validators_1.loginSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                message: 'Validation failed',
                errors: validation.error.flatten().fieldErrors,
            });
            return;
        }
        const result = await auth_service_1.authService.login(validation.data);
        res.status(200).json(result);
    }
    catch (error) {
        logger_1.default.error('Login endpoint error', error);
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};
exports.login = login;
/**
 * Refresh access token
 * POST /api/auth/refresh-token
 */
const refreshToken = async (req, res) => {
    try {
        const validation = auth_validators_1.refreshTokenSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                message: 'Validation failed',
                errors: validation.error.flatten().fieldErrors,
            });
            return;
        }
        const result = await auth_service_1.authService.refreshToken(validation.data.refreshToken);
        res.status(200).json(result);
    }
    catch (error) {
        logger_1.default.error('Refresh token endpoint error', error);
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};
exports.refreshToken = refreshToken;
/**
 * Logout a user
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
    try {
        const validation = auth_validators_1.refreshTokenSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                message: 'Validation failed',
                errors: validation.error.flatten().fieldErrors,
            });
            return;
        }
        await auth_service_1.authService.logout(validation.data.refreshToken);
        res.status(200).json({ message: 'Logged out successfully' });
    }
    catch (error) {
        logger_1.default.error('Logout endpoint error', error);
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};
exports.logout = logout;
/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
    try {
        const validation = auth_validators_1.forgotPasswordSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                message: 'Validation failed',
                errors: validation.error.flatten().fieldErrors,
            });
            return;
        }
        const result = await auth_service_1.authService.forgotPassword(validation.data.email);
        res.status(200).json(result);
    }
    catch (error) {
        logger_1.default.error('Forgot password endpoint error', error);
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};
exports.forgotPassword = forgotPassword;
/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
    try {
        const validation = auth_validators_1.resetPasswordSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                message: 'Validation failed',
                errors: validation.error.flatten().fieldErrors,
            });
            return;
        }
        const result = await auth_service_1.authService.resetPassword(validation.data.token, validation.data.password);
        res.status(200).json(result);
    }
    catch (error) {
        logger_1.default.error('Reset password endpoint error', error);
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};
exports.resetPassword = resetPassword;
/**
 * Change password (authenticated user)
 * POST /api/auth/change-password
 */
const changePassword = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const validation = auth_validators_1.changePasswordSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                message: 'Validation failed',
                errors: validation.error.flatten().fieldErrors,
            });
            return;
        }
        const result = await auth_service_1.authService.changePassword(req.user.userId, validation.data.currentPassword, validation.data.newPassword);
        res.status(200).json(result);
    }
    catch (error) {
        logger_1.default.error('Change password endpoint error', error);
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};
exports.changePassword = changePassword;
/**
 * Get current user
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const result = await auth_service_1.authService.getCurrentUser(req.user.userId, req.user.organizationId);
        res.status(200).json(result);
    }
    catch (error) {
        logger_1.default.error('Get current user endpoint error', error);
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};
exports.getCurrentUser = getCurrentUser;
