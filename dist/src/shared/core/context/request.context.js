"use strict";
/**
 * Request Context Storage (using AsyncLocalStorage for thread-safety)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestContextMiddleware = exports.RequestContextManager = void 0;
const async_hooks_1 = require("async_hooks");
const asyncLocalStorage = new async_hooks_1.AsyncLocalStorage();
class RequestContextManager {
    /**
     * Set request context
     */
    static setContext(context) {
        asyncLocalStorage.enterWith(context);
    }
    /**
     * Get current request context
     */
    static getContext() {
        return asyncLocalStorage.getStore();
    }
    /**
     * Get user ID from context
     */
    static getUserId() {
        return this.getContext()?.userId;
    }
    /**
     * Get organization ID from context
     */
    static getOrganizationId() {
        return this.getContext()?.organizationId;
    }
    /**
     * Get request ID from context
     */
    static getRequestId() {
        return this.getContext()?.requestId;
    }
    /**
     * Get IP from context
     */
    static getIp() {
        return this.getContext()?.ip;
    }
    /**
     * Get user agent from context
     */
    static getUserAgent() {
        return this.getContext()?.userAgent;
    }
    /**
     * Run function within a context
     */
    static run(context, fn) {
        return asyncLocalStorage.run(context, fn);
    }
}
exports.RequestContextManager = RequestContextManager;
const utils_1 = require("../../utils");
const requestContextMiddleware = (req, res, next) => {
    const requestId = utils_1.UUIDGenerator.generate();
    const userId = req.user?.id || 'anonymous';
    const organizationId = req.user?.organizationId || 'unknown';
    const ip = req.ip || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';
    const context = {
        requestId,
        userId,
        organizationId,
        ip,
        userAgent,
    };
    RequestContextManager.setContext(context);
    // Attach to response headers for tracking
    res.setHeader('X-Request-Id', requestId);
    next();
};
exports.requestContextMiddleware = requestContextMiddleware;
