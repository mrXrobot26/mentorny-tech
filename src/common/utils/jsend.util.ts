import { JSendSuccess, JSendFail, JSendError, JSEND_STATUS } from '../interfaces/jsend.interface';

/**
 * JSend utility class for creating standardized API responses
 */
export class JSendUtil {
  /**
   * Create a successful JSend response
   * @param data - The response data
   * @returns JSend success response
   */
  static success<T>(data: T): JSendSuccess<T> {
    return {
      status: JSEND_STATUS.SUCCESS,
      data,
    };
  }

  /**
   * Create a fail JSend response (client error)
   * @param data - The validation errors or failure data
   * @returns JSend fail response
   */
  static fail<T>(data: T): JSendFail<T> {
    return {
      status: JSEND_STATUS.FAIL,
      data,
    };
  }

  /**
   * Create an error JSend response (server error)
   * @param message - The error message
   * @param code - Optional error code
   * @param data - Optional additional error data
   * @returns JSend error response
   */
  static error(message: string, code?: string | number, data?: any): JSendError {
    const errorResponse: JSendError = {
      status: JSEND_STATUS.ERROR,
      message,
    };

    if (code !== undefined) {
      errorResponse.code = code;
    }

    if (data !== undefined) {
      errorResponse.data = data;
    }

    return errorResponse;
  }
} 