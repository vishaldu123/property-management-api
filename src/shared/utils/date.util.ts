import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { APP_CONSTANTS } from '../constants';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Date & Time Utilities
 */

export class DateUtil {
  private static readonly DEFAULT_TZ = APP_CONSTANTS.DATE.DEFAULT_TIMEZONE;

  /**
   * Get current date in default timezone
   */
  static now(): Dayjs {
    return dayjs().tz(this.DEFAULT_TZ);
  }

  /**
   * Get current UTC date
   */
  static nowUTC(): Dayjs {
    return dayjs.utc();
  }

  /**
   * Add duration to a date
   */
  static add(date: Date | string, value: number, unit: dayjs.ManipulateType): Date {
    return dayjs(date).add(value, unit).toDate();
  }

  /**
   * Subtract duration from a date
   */
  static subtract(date: Date | string, value: number, unit: dayjs.ManipulateType): Date {
    return dayjs(date).subtract(value, unit).toDate();
  }

  /**
   * Format a date
   */
  static format(date: Date | string, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
    return dayjs(date).format(format);
  }

  /**
   * Format date in timezone
   */
  static formatTZ(date: Date | string, tz: string, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
    return dayjs(date).tz(tz).format(format);
  }

  /**
   * Check if date is in the past
   */
  static isPast(date: Date | string): boolean {
    return dayjs(date).isBefore(this.now());
  }

  /**
   * Check if date is in the future
   */
  static isFuture(date: Date | string): boolean {
    return dayjs(date).isAfter(this.now());
  }

  /**
   * Check if date is expired
   */
  static isExpired(expiresAt: Date | string): boolean {
    return this.isPast(expiresAt);
  }

  /**
   * Get days until date
   */
  static daysUntil(date: Date | string): number {
    return dayjs(date).diff(this.now(), 'day');
  }

  /**
   * Get seconds until date
   */
  static secondsUntil(date: Date | string): number {
    return dayjs(date).diff(this.now(), 'second');
  }

  /**
   * Start of day
   */
  static startOfDay(date: Date | string = new Date()): Date {
    return dayjs(date).startOf('day').toDate();
  }

  /**
   * End of day
   */
  static endOfDay(date: Date | string = new Date()): Date {
    return dayjs(date).endOf('day').toDate();
  }

  /**
   * Parse JWT expiry duration (e.g., "7d", "24h", "30m")
   */
  static parseExpiry(expiryDuration: string): Date {
    const match = expiryDuration.match(/^(\d+)([dhms])$/);
    if (!match) {
      throw new Error(`Invalid expiry duration format: ${expiryDuration}`);
    }

    const [, value, unit] = match;
    const unitMap: Record<string, dayjs.ManipulateType> = {
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
  static parse(date: any): Date | null {
    try {
      const parsed = dayjs(date);
      return parsed.isValid() ? parsed.toDate() : null;
    } catch {
      return null;
    }
  }
}
