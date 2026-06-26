"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UUIDGenerator = void 0;
const crypto_1 = __importDefault(require("crypto"));
/**
 * UUID Generation Utilities
 */
class UUIDGenerator {
    static UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    /**
     * Generate a random UUID (v4)
     */
    static generate() {
        return crypto_1.default.randomUUID();
    }
    /**
     * Generate a namespaced UUID (v5)
     * @param name - The name to generate UUID from
     */
    static generateNamespaced(name) {
        return this.generateWithNamespace(name, 'default-namespace');
    }
    /**
     * Generate a namespaced UUID with custom namespace
     * @param name - The name to generate UUID from
     * @param namespace - The namespace UUID
     */
    static generateWithNamespace(name, namespace) {
        const hash = crypto_1.default.createHash('sha1').update(`${namespace}:${name}`).digest('hex');
        const base = hash.slice(0, 32);
        return `${base.slice(0, 8)}-${base.slice(8, 12)}-5${base.slice(13, 16)}-a${base.slice(17, 20)}-${base.slice(20, 32)}`;
    }
    /**
     * Validate if a string is a valid UUID
     */
    static validate(uuid) {
        return this.UUID_REGEX.test(uuid);
    }
    /**
     * Validate and throw error if invalid
     */
    static validateOrThrow(uuid, fieldName = 'ID') {
        if (!this.validate(uuid)) {
            throw new Error(`Invalid ${fieldName}: ${uuid}`);
        }
    }
}
exports.UUIDGenerator = UUIDGenerator;
