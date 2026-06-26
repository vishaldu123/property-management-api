"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UUIDGenerator = void 0;
const uuid_1 = require("uuid");
/**
 * UUID Generation Utilities
 */
class UUIDGenerator {
    static NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
    /**
     * Generate a random UUID (v4)
     */
    static generate() {
        return (0, uuid_1.v4)();
    }
    /**
     * Generate a namespaced UUID (v5)
     * @param name - The name to generate UUID from
     */
    static generateNamespaced(name) {
        return (0, uuid_1.v5)(name, this.NAMESPACE);
    }
    /**
     * Generate a namespaced UUID with custom namespace
     * @param name - The name to generate UUID from
     * @param namespace - The namespace UUID
     */
    static generateWithNamespace(name, namespace) {
        return (0, uuid_1.v5)(name, namespace);
    }
    /**
     * Validate if a string is a valid UUID
     */
    static validate(uuid) {
        return (0, uuid_1.validate)(uuid);
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
