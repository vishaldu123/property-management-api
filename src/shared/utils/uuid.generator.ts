import { v4 as uuidv4, v5 as uuidv5, validate as uuidValidate } from 'uuid';

/**
 * UUID Generation Utilities
 */

export class UUIDGenerator {
  private static readonly NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

  /**
   * Generate a random UUID (v4)
   */
  static generate(): string {
    return uuidv4();
  }

  /**
   * Generate a namespaced UUID (v5)
   * @param name - The name to generate UUID from
   */
  static generateNamespaced(name: string): string {
    return uuidv5(name, this.NAMESPACE);
  }

  /**
   * Generate a namespaced UUID with custom namespace
   * @param name - The name to generate UUID from
   * @param namespace - The namespace UUID
   */
  static generateWithNamespace(name: string, namespace: string): string {
    return uuidv5(name, namespace);
  }

  /**
   * Validate if a string is a valid UUID
   */
  static validate(uuid: string): boolean {
    return uuidValidate(uuid);
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
