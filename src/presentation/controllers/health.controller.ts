/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HealthIndicatorResult,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly configService: ConfigService,
    private readonly prismaHealthIndicator: PrismaHealthIndicator,
    private readonly prismaService: PrismaService,
  ) {}

  @Get('liveness')
  @HealthCheck()
  @ApiOperation({
    summary: 'Liveness Probe',
    description:
      'Verifica que la aplicación esté funcionando y pueda recibir tráfico',
  })
  @ApiOkResponse({
    description: 'Aplicación funcionando correctamente',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        info: {
          type: 'object',
          properties: {
            livelify_api: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
              },
            },
          },
        },
        error: { type: 'object' },
        details: {
          type: 'object',
          properties: {
            livelify_api: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Servicio no disponible',
  })
  liveness(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([
      (): HealthIndicatorResult => ({
        livelify_api: {
          status: 'up',
          timestamp: new Date().toISOString(),
          version: this.configService.get('APP_VERSION', 'v1'),
          environment: this.configService.get('APP_ENV', 'development'),
        },
      }),
    ]);
  }

  @Get('readiness')
  @HealthCheck()
  @ApiOperation({
    summary: 'Readiness Probe',
    description:
      'Verifica que la aplicación esté lista para recibir tráfico (incluye verificación de base de datos)',
  })
  @ApiOkResponse({
    description: 'Aplicación y dependencias funcionando correctamente',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        info: {
          type: 'object',
          properties: {
            livelify_api: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
              },
            },
            database: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
              },
            },
          },
        },
        error: { type: 'object' },
        details: {
          type: 'object',
          properties: {
            livelify_api: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
              },
            },
            database: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Servicio o dependencias no disponibles',
  })
  readiness(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([
      // Check application status
      (): HealthIndicatorResult => ({
        livelify_api: {
          status: 'up',
          timestamp: new Date().toISOString(),
          version: this.configService.get('APP_VERSION', 'v1'),
          environment: this.configService.get('APP_ENV', 'development'),
        },
      }),
      // Check database connectivity
      () =>
        this.prismaHealthIndicator.pingCheck('database', this.prismaService),
    ]);
  }

  @Get('startup')
  @HealthCheck()
  @ApiOperation({
    summary: 'Startup Probe',
    description:
      'Verifica que la aplicación haya iniciado correctamente (útil para contenedores)',
  })
  @ApiOkResponse({
    description: 'Aplicación iniciada correctamente',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        info: {
          type: 'object',
          properties: {
            startup: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
              },
            },
          },
        },
        error: { type: 'object' },
        details: {
          type: 'object',
          properties: {
            startup: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Aplicación aún iniciando',
  })
  startup(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([
      (): HealthIndicatorResult => ({
        startup: {
          status: 'up',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          pid: process.pid,
          version: this.configService.get('APP_VERSION', 'v1'),
          environment: this.configService.get('APP_ENV', 'development'),
        },
      }),
    ]);
  }
}
