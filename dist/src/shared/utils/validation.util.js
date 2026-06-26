"use strict";
/**
 * Validation Utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationUtil = void 0;
class ValidationUtil {
    /**
     * Validate email format
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    /**
     * Validate phone number format
     */
    static isValidPhone(phone) {
        const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
        return phoneRegex.test(phone);
    }
    /**
     * Validate UUID format
     */
    static isValidUUID(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }
    /**
     * Validate slug format
     */
    static isValidSlug(slug) {
        const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
        return slugRegex.test(slug);
    }
    /**
     * Validate URL format
     */
    static isValidURL(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Validate string length
     */
    static isValidLength(value, min, max) {
        return value.length >= min && value.length <= max;
    }
    /**
     * Validate required field
     */
    static isRequired(value) {
        if (value === null || value === undefined)
            return false;
        if (typeof value === 'string')
            return value.trim().length > 0;
        if (Array.isArray(value))
            return value.length > 0;
        return true;
    }
    /**
     * Sanitize string input
     */
    static sanitizeString(value) {
        return value
            .trim()
            .replace(/[<>]/g, '') // Remove angle brackets
            .slice(0, 1000); // Limit length
    }
    /**
     * Normalize email
     */
    static normalizeEmail(email) {
        return email.toLowerCase().trim();
    }
    /**
     * Slugify a string
     */
    static slugify(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
}
exports.ValidationUtil = ValidationUtil;
