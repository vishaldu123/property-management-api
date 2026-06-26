import crypto from 'crypto';

/**
 * UUID Generation Utilities
 */

export class UUIDGenerator {
  private static readonly UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  /**
   * Generate a random UUID (v4)
   */
  static generate(): string {
    return crypto.randomUUID();
  }

  /**
   * Generate a namespaced UUID (v5)
   * @param name - The name to generate UUID from
   */
  static generateNamespaced(name: string): string {
    return this.generateWithNamespace(name, 'default-namespace');
  }

  /**
   * Generate a namespaced UUID with custom namespace
   * @param name - The name to generate UUID from
   * @param namespace - The namespace UUID
   */
  static generateWithNamespace(name: string, namespace: string): string {
    const hash = crypto.createHash('sha1').update(`${namespace}:${name}`).digest('hex');
    const base = hash.slice(0, 32);

    return `${base.slice(0, 8)}-${base.slice(8, 12)}-5${base.slice(13, 16)}-a${base.slice(17, 20)}-${base.slice(20, 32)}`;
  }

  /**
   * Validate if a string is a valid UUID
   */
  static validate(uuid: string): boolean {
    return this.UUID_REGEX.test(uuid);
  }

  /**
   * Validate and throw error if invalid
   */
  static validateOrThrow(uuid: string, fieldName: string = 'ID'): void {
    if (!this.validate(uuid)) {
      throw new Error(`Invalid ${fieldName}: ${uuid}`);
    }
  }
}
