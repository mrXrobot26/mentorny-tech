/**
 * JSend response specification interfaces
 * @see https://github.com/omniti-labs/jsend
 */

export interface JSendSuccess<T = any> {
  status: 'success';
  data: T;
}

export interface JSendFail<T = any> {
  status: 'fail';
  data: T;
}

export interface JSendError {
  status: 'error';
  message: string;
  code?: string | number;
  data?: any;
}

export type JSendResponse<T = any> = JSendSuccess<T> | JSendFail<T> | JSendError;

/**
 * JSend status constants
 */
export const JSEND_STATUS = {
  SUCCESS: 'success' as const,
  FAIL: 'fail' as const,
  ERROR: 'error' as const,
} as const;

export type JSendStatus = typeof JSEND_STATUS[keyof typeof JSEND_STATUS]; 