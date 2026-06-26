"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateUtil = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
const constants_1 = require("../constants");
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
/**
 * Date & Time Utilities
 */
class DateUtil {
    static DEFAULT_TZ = constants_1.APP_CONSTANTS.DATE.DEFAULT_TIMEZONE;
    /**
     * Get current date in default timezone
     */
    static now() {
        return (0, dayjs_1.default)().tz(this.DEFAULT_TZ);
    }
    /**
     * Get current UTC date
     */
    static nowUTC() {
        return dayjs_1.default.utc();
    }
    /**
     * Add duration to a date
     */
    static add(date, value, unit) {
        return (0, dayjs_1.default)(date).add(value, unit).toDate();
    }
    /**
     * Subtract duration from a date
     */
    static subtract(date, value, unit) {
        return (0, dayjs_1.default)(date).subtract(value, unit).toDate();
    }
    /**
     * Format a date
     */
    static format(date, format = 'YYYY-MM-DD HH:mm:ss') {
        return (0, dayjs_1.default)(date).format(format);
    }
    /**
     * Format date in timezone
     */
    static formatTZ(date, tz, format = 'YYYY-MM-DD HH:mm:ss') {
        return (0, dayjs_1.default)(date).tz(tz).format(format);
    }
    /**
     * Check if date is in the past
     */
    static isPast(date) {
        return (0, dayjs_1.default)(date).isBefore(this.now());
    }
    /**
     * Check if date is in the future
     */
    static isFuture(date) {
        return (0, dayjs_1.default)(date).isAfter(this.now());
    }
    /**
     * Check if date is expired
     */
    static isExpired(expiresAt) {
        return this.isPast(expiresAt);
    }
    /**
     * Get days until date
     */
    static daysUntil(date) {
        return (0, dayjs_1.default)(date).diff(this.now(), 'day');
    }
    /**
     * Get seconds until date
     */
    static secondsUntil(date) {
        return (0, dayjs_1.default)(date).diff(this.now(), 'second');
    }
    /**
     * Start of day
     */
    static startOfDay(date = new Date()) {
        return (0, dayjs_1.default)(date).startOf('day').toDate();
    }
    /**
     * End of day
     */
    static endOfDay(date = new Date()) {
        return (0, dayjs_1.default)(date).endOf('day').toDate();
    }
    /**
     * Parse JWT expiry duration (e.g., "7d", "24h", "30m")
     */
    static parseExpiry(expiryDuration) {
        const match = expiryDuration.match(/^(\d+)([dhms])$/);
        if (!match) {
            throw new Error(`Invalid expiry duration format: ${expiryDuration}`);
        }
        const [, value, unit] = match;
        const unitMap = {
            d: 'day',
            h: 'hour',
            m: 'minute',
            s: 'second',
        };
        return this.add(this.now().toDate(), parseInt(value), unitMap[unit]);
    }
    /**
     * Parse date safely
     */
    static parse(date) {
        try {
            const parsed = (0, dayjs_1.default)(date);
            return parsed.isValid() ? parsed.toDate() : null;
        }
        catch {
            return null;
        }
    }
}
exports.DateUtil = DateUtil;
