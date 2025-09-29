/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { INestApplication } from '@nestjs/common';
import helmet from 'helmet';

/**
 * 🔒 Security Configuration
 * Configure security headers and policies for the API
 */
export const configureSecurityHeaders = (app: INestApplication): void => {
  const VERSION = process.env.APP_VERSION ?? 'v1';
  const ENVIRONMENT = process.env.APP_ENV || 'development';
  const IS_PRODUCTION = ENVIRONMENT === 'production';

  // 🛡️ Helmet Configuration
  app.use(
    helmet({
      // Content Security Policy
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://cdn.jsdelivr.net',
            'https://fonts.googleapis.com',
          ],
          scriptSrc: [
            "'self'",
            IS_PRODUCTION ? '' : "'unsafe-inline'", // Allow inline scripts only in dev
            IS_PRODUCTION ? '' : "'unsafe-eval'", // Swagger needs unsafe-eval in dev
          ].filter(Boolean),
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: [
            "'self'",
            'https://cdn.jsdelivr.net',
            'https://fonts.gstatic.com',
          ],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
          baseUri: ["'self'"],
          manifestSrc: ["'self'"],
          workerSrc: ["'self'"],
        },
      },

      // Cross-Origin Policies
      crossOriginEmbedderPolicy: false, // Disabled for API compatibility
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },

      // DNS Prefetch Control
      dnsPrefetchControl: { allow: false },

      // Frame Options - Prevent clickjacking
      frameguard: { action: 'deny' },

      // Hide Powered-By header
      hidePoweredBy: true,

      // HTTP Strict Transport Security (HTTPS only in production)
      hsts: IS_PRODUCTION
        ? {
            maxAge: 31536000, // 1 year
            includeSubDomains: true,
            preload: true,
          }
        : false,

      // IE No Open
      ieNoOpen: true,

      // No Sniff - Prevent MIME type sniffing
      noSniff: true,

      // Origin Agent Cluster
      originAgentCluster: true,

      // Permitted Cross-Domain Policies
      permittedCrossDomainPolicies: false,

      // Referrer Policy
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

      // X-XSS-Protection
      xssFilter: true,
    }),
  );

  // 🔒 Additional Custom Security Headers
  app.use((req, res, next) => {
    // Server Information (Minimal disclosure)
    res.setHeader('Server', 'Livelify-API');

    // API Version Header
    res.setHeader('X-API-Version', VERSION);

    // Environment indicator (only in non-production)
    if (!IS_PRODUCTION) {
      res.setHeader('X-Environment', ENVIRONMENT);
    }

    // Security Contact
    res.setHeader('X-Security-Contact', 'security@livelify.com');

    // Content Type Options (Double protection)
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Download Options for IE
    res.setHeader('X-Download-Options', 'noopen');

    // Permissions Policy (Feature Policy replacement)
    const permissionsPolicy = [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()', // Disable FLoC
      'browsing-topics=()', // Disable Topics API
      'payment=()',
      'usb=()',
      'serial=()',
      'bluetooth=()',
      'magnetometer=()',
      'accelerometer=()',
      'gyroscope=()',
      'ambient-light-sensor=()',
    ].join(', ');
    res.setHeader('Permissions-Policy', permissionsPolicy);

    // Rate Limiting Information
    res.setHeader('X-RateLimit-Policy', 'API rate limits apply');
    res.setHeader('X-RateLimit-Auth', '5 per 15 minutes');
    res.setHeader('X-RateLimit-Default', '100 per minute');
    res.setHeader('X-RateLimit-Strict', '10 per minute');

    // Cache Control for API responses
    if (req.path.includes('/api/')) {
      res.setHeader(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, private',
      );
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    // Remove potentially sensitive headers
    res.removeHeader('X-Powered-By');
    res.removeHeader('x-powered-by');

    next();
  });

  console.log('🔒 Security headers configured successfully');
};

/**
 * 🛡️ Security Headers Information
 */
export const getSecurityInfo = () => {
  return {
    helmet: '✅ Enabled',
    csp: '✅ Content Security Policy',
    hsts:
      process.env.APP_ENV === 'production'
        ? '✅ HTTPS only'
        : '⚠️  Disabled in dev',
    frameProtection: '✅ X-Frame-Options: DENY',
    xssProtection: '✅ XSS filtering enabled',
    contentTypeSniffing: '✅ Disabled',
    referrerPolicy: '✅ Strict origin when cross-origin',
    permissionsPolicy: '✅ Restrictive feature policy',
    rateLimiting: '✅ Multi-tier rate limiting',
    dnsPrefetch: '✅ Disabled',
    hiddenServerInfo: '✅ Server header minimized',
  };
};
