import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import type * as ms from 'ms';

// Hexagonal Architecture Modules
import { PresentationModule } from './presentation/presentation.module';
import { ApplicationModule } from './application/application.module';
import { DatabaseModule } from './infrastructure/config/database.module';
import { LoggerModule } from './infrastructure/config/logger.module';
import { LoggingInterceptor } from './infrastructure/config/logging.interceptor';

function getEnvFilePath(): string {
  const environment =
    process.env.APP_ENV || process.env.NODE_ENV || 'development';

  console.log(`🌍 Loading environment: ${environment}`);
  console.log(`📁 Environment file: .env.${environment}`);

  return `.env.${environment}`;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFilePath(),
      expandVariables: true,
    }),
    LoggerModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const expiresIn = (configService.get<string>('APP_JWT_EXPIRE') ||
          '1h') as ms.StringValue;
        return {
          secret: configService.get<string>('APP_JWT_SECRET'),
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Fix: Convert string env vars to numbers properly
        const ttlString = configService.get<string>('THROTTLE_TTL', '60000');
        const limitString = configService.get<string>('THROTTLE_LIMIT', '100');

        const ttl = parseInt(ttlString);
        const limit = parseInt(limitString);

        // Fallback to hardcoded values if parsing fails
        const finalTtl = isNaN(ttl) ? 60000 : ttl;
        const finalLimit = isNaN(limit) ? 100 : limit;

        return {
          throttlers: [
            {
              ttl: finalTtl, // 1 minute
              limit: finalLimit, // requests per minute
            },
          ],
        };
      },
    }),
    DatabaseModule,
    ApplicationModule,
    PresentationModule,
  ],
  controllers: [],
  providers: [
    // Global Rate Limiting Guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global Logging Interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
