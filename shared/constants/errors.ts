/**
 * Shared error codes and messages
 */

export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.UNAUTHORIZED]: 'Authentication required',
  [ErrorCode.FORBIDDEN]: 'Access denied',
  [ErrorCode.NOT_FOUND]: 'Resource not found',
  [ErrorCode.VALIDATION_ERROR]: 'Invalid input',
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Too many requests',
  [ErrorCode.INTERNAL_ERROR]: 'Internal server error',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable',
}
