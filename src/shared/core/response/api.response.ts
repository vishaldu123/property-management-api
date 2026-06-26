import { Response } from 'express';
import { APP_CONSTANTS } from '../../constants';

/**
 * Unified API Response Format
 */

export class ApiResponse {
  /**
   * Send success response
   */
  static success<T>(
    res: Response,
    data: T,
    message: string = APP_CONSTANTS.MESSAGE.SUCCESS,
    statusCode: number = APP_CONSTANTS.HTTP_STATUS.OK
  ): void {
    res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Send paginated success response
   */
  static paginated<T>(
    res: Response,
    data: T[],
    meta: any,
    message: string = APP_CONSTANTS.MESSAGE.SUCCESS,
    statusCode: number = APP_CONSTANTS.HTTP_STATUS.OK
  ): void {
    res.status(statusCode).json({
      success: true,
      message,
      data,
      meta,
    });
  }

  /**
   * Send created response
   */
  static created<T>(
    res: Response,
    data: T,
    message: string = APP_CONSTANTS.MESSAGE.CREATED
  ): void {
    this.success(res, data, message, APP_CONSTANTS.HTTP_STATUS.CREATED);
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    message: string = APP_CONSTANTS.MESSAGE.INTERNAL_ERROR,
    statusCode: number = APP_CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errors?: Record<string, any>
  ): void {
    res.status(statusCode).json({
      success: false,
      message,
      errors: errors || [],
    });
  }

  /**
   * Send validation error response
   */
  static validationError(
    res: Response,
    errors: Record<string, string[]>,
    message: string = APP_CONSTANTS.MESSAGE.INVALID_INPUT
  ): void {
    res.status(APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message,
      errors,
    });
  }

  /**
   * Send not found error response
   */
  static notFound(
    res: Response,
    message: string = APP_CONSTANTS.MESSAGE.NOT_FOUND
  ): void {
    this.error(res, message, APP_CONSTANTS.HTTP_STATUS.NOT_FOUND);
  }

  /**
   * Send unauthorized error response
   */
  static unauthorized(
    res: Response,
    message: string = APP_CONSTANTS.MESSAGE.UNAUTHORIZED
  ): void {
    this.error(res, message, APP_CONSTANTS.HTTP_STATUS.UNAUTHORIZED);
  }

  /**
   * Send forbidden error response
   */
  static forbidden(
    res: Response,
    message: string = APP_CONSTANTS.MESSAGE.FORBIDDEN
  ): void {
    this.error(res, message, APP_CONSTANTS.HTTP_STATUS.FORBIDDEN);
  }

  /**
   * Send conflict error response
   */
  static conflict(
    res: Response,
    message: string = APP_CONSTANTS.MESSAGE.CONFLICT
  ): void {
    this.error(res, message, APP_CONSTANTS.HTTP_STATUS.CONFLICT);
  }
}
