import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Hexagonal Architecture Modules
import { PresentationModule } from './presentation/presentation.module';
import { ApplicationModule } from './application/application.module';
import { DatabaseModule } from './infrastructure/config/database.module';

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
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('APP_JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('APP_JWT_EXPIRE', '1h'),
        },
      }),
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          name: 'default',
          ttl: configService.get<number>('THROTTLE_TTL', 60000), // 1 minute
          limit: configService.get<number>('THROTTLE_LIMIT', 100), // 100 requests per minute
        },
        {
          name: 'auth',
          ttl: configService.get<number>('THROTTLE_AUTH_TTL', 900000), // 15 minutes
          limit: configService.get<number>('THROTTLE_AUTH_LIMIT', 5), // 5 login attempts per 15 minutes
        },
        {
          name: 'strict',
          ttl: configService.get<number>('THROTTLE_STRICT_TTL', 60000), // 1 minute
          limit: configService.get<number>('THROTTLE_STRICT_LIMIT', 10), // 10 requests per minute
        },
      ],
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
  ],
})
export class AppModule {}
