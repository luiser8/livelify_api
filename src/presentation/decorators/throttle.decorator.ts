import { SetMetadata } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

/**
 * 🚦 Custom Throttle Decorators for Different Rate Limiting Levels
 */

// Rate limiting levels based on security and usage patterns
export const THROTTLE_LEVELS = {
  // 🔓 Public endpoints (documentation, health checks)
  PUBLIC: 'public',
  // 🌐 General API usage
  DEFAULT: 'default',
  // 🔐 Authentication endpoints (more restrictive)
  AUTH: 'auth',
  // 🚨 Strict endpoints (admin, sensitive operations)
  STRICT: 'strict',
  // 📊 Data intensive endpoints
  DATA: 'data',
} as const;

/**
 * 🔓 Public Rate Limiting - Very permissive
 * For documentation, health checks, public info
 */
export const PublicThrottle = () =>
  Throttle({ default: { limit: 1000, ttl: 60000 } }); // 1000 requests per minute

/**
 * 🌐 Default Rate Limiting - Standard usage
 * For general API endpoints
 */
export const DefaultThrottle = () =>
  Throttle({ default: { limit: 100, ttl: 60000 } }); // 100 requests per minute

/**
 * 🔐 Auth Rate Limiting - Restrictive for security
 * For login, register, password reset
 */
export const AuthThrottle = () => Throttle({ auth: { limit: 5, ttl: 900000 } }); // 5 attempts per 15 minutes

/**
 * 🚨 Strict Rate Limiting - Very restrictive
 * For admin operations, sensitive data access
 */
export const StrictThrottle = () =>
  Throttle({ strict: { limit: 10, ttl: 60000 } }); // 10 requests per minute

/**
 * 📊 Data Rate Limiting - For data-intensive operations
 * For bulk operations, exports, reports
 */
export const DataThrottle = () =>
  Throttle({ data: { limit: 20, ttl: 300000 } }); // 20 requests per 5 minutes

/**
 * 🎯 Custom Throttle - For specific requirements
 * @param limit Number of requests allowed
 * @param ttl Time window in milliseconds
 */
export const CustomThrottle = (limit: number, ttl: number) =>
  Throttle({ custom: { limit, ttl } });

/**
 * 🚫 Skip Throttle - Disable rate limiting
 * For internal endpoints or testing
 */
export const SkipThrottle = (skip = true) => SetMetadata('skipThrottle', skip);

/**
 * 📋 Rate Limit Information for Documentation
 */
export const RATE_LIMIT_INFO = {
  PUBLIC: {
    limit: 1000,
    window: '1 minute',
    description: 'Very permissive for public endpoints',
  },
  DEFAULT: {
    limit: 100,
    window: '1 minute',
    description: 'Standard rate limiting for general API usage',
  },
  AUTH: {
    limit: 5,
    window: '15 minutes',
    description: 'Strict limiting for authentication endpoints',
  },
  STRICT: {
    limit: 10,
    window: '1 minute',
    description: 'Very restrictive for sensitive operations',
  },
  DATA: {
    limit: 20,
    window: '5 minutes',
    description: 'Moderate limiting for data-intensive operations',
  },
} as const;

/**
 * 🎨 Rate Limit Level Validator
 * Ensures rate limit configurations are appropriate for endpoint types
 */
export const validateRateLimitLevel = (
  endpoint: string,
  level: keyof typeof THROTTLE_LEVELS,
): boolean => {
  const authEndpoints = ['/auth/login', '/auth/register', '/auth/refresh'];
  const publicEndpoints = ['/health', '/docs', '/'];
  const dataEndpoints = ['/export', '/import', '/bulk'];

  switch (level) {
    case 'AUTH':
      return authEndpoints.some((path) => endpoint.includes(path));
    case 'PUBLIC':
      return publicEndpoints.some((path) => endpoint.includes(path));
    case 'DATA':
      return dataEndpoints.some((path) => endpoint.includes(path));
    case 'STRICT':
      return endpoint.includes('/admin') || endpoint.includes('/settings');
    default:
      return true; // DEFAULT level is always valid
  }
};
