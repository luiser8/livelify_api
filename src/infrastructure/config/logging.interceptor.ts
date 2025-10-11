import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { CustomLoggerService } from './logger.service';

interface ErrorWithStatus {
  status?: number;
  stack?: string;
  message?: string;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: CustomLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();

    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || 'Unknown';
    const startTime = Date.now();

    // Log de entrada de la request
    this.logger.debug(
      `Incoming request: ${method} ${url} from ${ip} - ${userAgent}`,
      'HTTP',
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          const { statusCode } = response;

          // Log de respuesta exitosa
          this.logger.logRequest(method, url, statusCode, responseTime);

          // Log adicional para endpoints críticos
          if (this.isCriticalEndpoint(url)) {
            this.logger.log(
              `Critical endpoint accessed: ${method} ${url} - Response: ${statusCode}`,
              'CRITICAL',
            );
          }

          // Log de respuestas lentas
          if (responseTime > 2000) {
            this.logger.warn(
              `Slow response detected: ${method} ${url} took ${responseTime}ms`,
              'PERFORMANCE',
            );
          }
        },
        error: (error: ErrorWithStatus) => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          const statusCode = error.status ?? 500;

          // Log de error
          this.logger.error(
            `Request failed: ${method} ${url} - ${statusCode} - ${responseTime}ms`,
            error.stack,
            'HTTP_ERROR',
          );

          // Log de eventos de seguridad
          if (this.isSecurityRelated(error, url)) {
            this.logger.logSecurityEvent(
              'Request failed with security implications',
              {
                method,
                url,
                statusCode,
                error: error.message ?? 'Unknown error',
                ip,
                userAgent,
              },
            );
          }
        },
      }),
    );
  }

  private isCriticalEndpoint(url: string): boolean {
    const criticalPatterns = [
      '/auth/login',
      '/auth/refresh',
      '/auth/logout',
      '/users/register',
      '/users/update',
    ];

    return criticalPatterns.some((pattern) => url.includes(pattern));
  }

  private isSecurityRelated(error: ErrorWithStatus, url: string): boolean {
    const securityStatusCodes = [401, 403, 429];
    const securityEndpoints = ['/auth/', '/users/'];

    return (
      securityStatusCodes.includes(error.status ?? 0) ||
      securityEndpoints.some((endpoint) => url.includes(endpoint))
    );
  }
}
