import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

/**
 * Password Utilities
 */

export class PasswordUtil {
  private static readonly SALT_ROUNDS = 10;
  private static readonly PASSWORD_MIN_LENGTH = 8;
  private static readonly PASSWORD_REGEX = {
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    number: /[0-9]/,
    special: /[!@#$%^&*(),.?":{}|<>]/,
  };

  /**
   * Hash a password using bcrypt
   */
  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Compare a plain password with a hashed password
   */
  static async compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Validate password strength
   */
  static validateStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

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
  static generate(length: number = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}

/**
 * Token Utilities
 */

export class TokenUtil {
  /**
   * Generate a secure random token
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate a verification code (numeric)
   */
  static generateVerificationCode(length: number = 6): string {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
  }

  /**
   * Hash a token for storage
   */
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Verify a token against its hash
   */
  static verifyToken(token: string, hash: string): boolean {
    const computedHash = this.hashToken(token);
    return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(hash));
  }
}
