"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenUtil = exports.PasswordUtil = void 0;
const crypto = __importStar(require("crypto"));
const bcrypt = __importStar(require("bcrypt"));
/**
 * Password Utilities
 */
class PasswordUtil {
    static SALT_ROUNDS = 10;
    static PASSWORD_MIN_LENGTH = 8;
    static PASSWORD_REGEX = {
        uppercase: /[A-Z]/,
        lowercase: /[a-z]/,
        number: /[0-9]/,
        special: /[!@#$%^&*(),.?":{}|<>]/,
    };
    /**
     * Hash a password using bcrypt
     */
    static async hash(password) {
        return bcrypt.hash(password, this.SALT_ROUNDS);
    }
    /**
     * Compare a plain password with a hashed password
     */
    static async compare(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
    /**
     * Validate password strength
     */
    static validateStrength(password) {
        const errors = [];
        if (password.length < this.PASSWORD_MIN_LENGTH) {
            errors.push(`Password must be at least ${this.PASSWORD_MIN_LENGTH} characters long`);
        }
        if (!this.PASSWORD_REGEX.uppercase.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!this.PASSWORD_REGEX.lowercase.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!this.PASSWORD_REGEX.number.test(password)) {
            errors.push('Password must contain at least one number');
        }
        if (!this.PASSWORD_REGEX.special.test(password)) {
            errors.push('Password must contain at least one special character');
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    /**
     * Generate a random password
     */
    static generate(length = 16) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }
}
exports.PasswordUtil = PasswordUtil;
/**
 * Token Utilities
 */
class TokenUtil {
    /**
     * Generate a secure random token
     */
    static generateSecureToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }
    /**
     * Generate a verification code (numeric)
     */
    static generateVerificationCode(length = 6) {
        return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
    }
    /**
     * Hash a token for storage
     */
    static hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
    /**
     * Verify a token against its hash
     */
    static verifyToken(token, hash) {
        const computedHash = this.hashToken(token);
        return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(hash));
    }
}
exports.TokenUtil = TokenUtil;
