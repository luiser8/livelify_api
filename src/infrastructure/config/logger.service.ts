import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CustomLoggerService implements LoggerService {
  private context?: string;
  private logLevel: LogLevel[];

  constructor(private readonly configService: ConfigService) {
    this.setLogLevel();
  }

  private setLogLevel(): void {
    const envLogLevel = this.configService.get<string>('LOG_LEVEL', 'info');

    // Mapear niveles de log según configuración del entorno
    const logLevelMap: Record<string, LogLevel[]> = {
      debug: ['error', 'warn', 'log', 'debug', 'verbose'],
      info: ['error', 'warn', 'log'],
      warn: ['error', 'warn'],
      error: ['error'],
    };

    this.logLevel = logLevelMap[envLogLevel] || logLevelMap.info;
  }

  setContext(context: string): void {
    this.context = context;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.logLevel.includes(level);
  }

  private formatMessage(
    level: string,
    message: unknown,
    context?: string,
  ): string {
    const timestamp = new Date().toISOString();
    const env = this.configService.get<string>('APP_ENV', 'development');
    const ctx = context || this.context || 'Application';

    const logPrefix = `[${env.toUpperCase()}] ${timestamp} [${level.toUpperCase()}] [${ctx}]`;

    if (typeof message === 'object') {
      return `${logPrefix} ${JSON.stringify(message, null, 2)}`;
    }

    return `${logPrefix} ${message}`;
  }

  log(message: unknown, context?: string): void {
    if (!this.shouldLog('log')) return;
    console.log(this.formatMessage('info', message, context));
  }

  error(message: unknown, trace?: string, context?: string): void {
    if (!this.shouldLog('error')) return;
    console.error(this.formatMessage('error', message, context));
    if (trace) {
      console.error(`Stack trace: ${trace}`);
    }
  }

  warn(message: unknown, context?: string): void {
    if (!this.shouldLog('warn')) return;
    console.warn(this.formatMessage('warn', message, context));
  }

  debug(message: unknown, context?: string): void {
    if (!this.shouldLog('debug')) return;
    console.debug(this.formatMessage('debug', message, context));
  }

  verbose(message: unknown, context?: string): void {
    if (!this.shouldLog('verbose')) return;
    console.log(this.formatMessage('verbose', message, context));
  }

  // Métodos adicionales para casos específicos
  logRequest(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    context = 'HTTP',
  ): void {
    const message = `${method} ${url} ${statusCode} - ${responseTime}ms`;

    if (statusCode >= 500) {
      this.error(message, undefined, context);
    } else if (statusCode >= 400) {
      this.warn(message, context);
    } else {
      this.log(message, context);
    }
  }

  logAuthAttempt(
    email: string,
    success: boolean,
    ip?: string,
    context = 'AUTH',
  ): void {
    const status = success ? 'SUCCESS' : 'FAILED';
    const message = `Login attempt ${status} for ${email}${ip ? ` from ${ip}` : ''}`;

    if (success) {
      this.log(message, context);
    } else {
      this.warn(message, context);
    }
  }

  logDatabaseOperation(
    operation: string,
    table: string,
    duration: number,
    context = 'DATABASE',
  ): void {
    const message = `${operation} on ${table} completed in ${duration}ms`;

    if (duration > 1000) {
      this.warn(`SLOW QUERY: ${message}`, context);
    } else {
      this.debug(message, context);
    }
  }

  logSecurityEvent(
    event: string,
    details: unknown,
    context = 'SECURITY',
  ): void {
    const message = `Security event: ${event}`;
    this.warn(message, context);
    this.debug(details, context);
  }
}
