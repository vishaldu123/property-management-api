"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
const constants_1 = require("../../constants");
/**
 * Unified API Response Format
 */
class ApiResponse {
    /**
     * Send success response
     */
    static success(res, data, message = constants_1.APP_CONSTANTS.MESSAGE.SUCCESS, statusCode = constants_1.APP_CONSTANTS.HTTP_STATUS.OK) {
        res.status(statusCode).json({
            success: true,
            message,
            data,
        });
    }
    /**
     * Send paginated success response
     */
    static paginated(res, data, meta, message = constants_1.APP_CONSTANTS.MESSAGE.SUCCESS, statusCode = constants_1.APP_CONSTANTS.HTTP_STATUS.OK) {
        res.status(statusCode).json({
            success: true,
            message,
            data,
            meta,
        });
    }
    /**
     * Send created response
     */
    static created(res, data, message = constants_1.APP_CONSTANTS.MESSAGE.CREATED) {
        this.success(res, data, message, constants_1.APP_CONSTANTS.HTTP_STATUS.CREATED);
    }
    /**
     * Send error response
     */
    static error(res, message = constants_1.APP_CONSTANTS.MESSAGE.INTERNAL_ERROR, statusCode = constants_1.APP_CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR, errors) {
        res.status(statusCode).json({
            success: false,
            message,
            errors: errors || [],
        });
    }
    /**
     * Send validation error response
     */
    static validationError(res, errors, message = constants_1.APP_CONSTANTS.MESSAGE.INVALID_INPUT) {
        res.status(constants_1.APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message,
            errors,
        });
    }
    /**
     * Send not found error response
     */
    static notFound(res, message = constants_1.APP_CONSTANTS.MESSAGE.NOT_FOUND) {
        this.error(res, message, constants_1.APP_CONSTANTS.HTTP_STATUS.NOT_FOUND);
    }
    /**
     * Send unauthorized error response
     */
    static unauthorized(res, message = constants_1.APP_CONSTANTS.MESSAGE.UNAUTHORIZED) {
        this.error(res, message, constants_1.APP_CONSTANTS.HTTP_STATUS.UNAUTHORIZED);
    }
    /**
     * Send forbidden error response
     */
    static forbidden(res, message = constants_1.APP_CONSTANTS.MESSAGE.FORBIDDEN) {
        this.error(res, message, constants_1.APP_CONSTANTS.HTTP_STATUS.FORBIDDEN);
    }
    /**
     * Send conflict error response
     */
    static conflict(res, message = constants_1.APP_CONSTANTS.MESSAGE.CONFLICT) {
        this.error(res, message, constants_1.APP_CONSTANTS.HTTP_STATUS.CONFLICT);
    }
}
exports.ApiResponse = ApiResponse;
