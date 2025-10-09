/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { swaggerInit } from './swagger.config';
import { configureSecurityHeaders, getSecurityInfo } from './security.config';
import { ValidationPipe } from '@nestjs/common';
import { CustomLoggerService } from './infrastructure/config/logger.service';

const PORT = +(process.env.PORT ?? process.env.APP_PORT ?? 3000);
const PREFIX = process.env.APP_PREFIX ?? '';
const VERSION = process.env.APP_VERSION ?? 'v1';
const GLOBAL_PREFIX = PREFIX ? `${PREFIX}/${VERSION}` : VERSION;
const SECURITY_ALLOWED_ORIGINS = process.env.APP_ALLOWED_ORIGINS;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 📝 Configure Custom Logger
  const logger = app.get(CustomLoggerService);
  logger.setContext('Bootstrap');
  app.useLogger(logger);

  logger.log('🚀 Starting Livelify API...');
  logger.log(`🌍 Environment: ${process.env.APP_ENV || 'development'}`);
  logger.log(`📊 Log Level: ${process.env.LOG_LEVEL || 'info'}`);

  // 🔒 Configure Security Headers
  configureSecurityHeaders(app);

  // 📚 Initialize Swagger documentation
  swaggerInit(app);

  // 🌐 Configure CORS
  const allowedOrigins = (SECURITY_ALLOWED_ORIGINS ?? '').split(';');
  app.enableCors({
    origin: (origin, resolve) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return resolve(null, true);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      if (allowedOrigins.includes(origin)) return resolve(null, true);

      return resolve(null, false);
    },
    credentials: true,
  });

  // 🔧 Global Configuration
  app.setGlobalPrefix(GLOBAL_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
    }),
  );
  app.enableVersioning();

  // 🚀 Start Server
  await app.listen(PORT || 3000, () => {
    logger.log(`🚀 Livelify API started successfully!`);
    logger.log(`📍 API: http://localhost:${PORT}/${GLOBAL_PREFIX}`);
    logger.log(`📚 Docs: http://localhost:${PORT}/${GLOBAL_PREFIX}/docs`);

    // 🔒 Security Information
    const securityInfo = getSecurityInfo();
    logger.log('🔒 Security Features initialized');
    logger.debug('Security configuration:', 'SECURITY');
    Object.entries(securityInfo).forEach(([key, value]) => {
      logger.debug(`   ${key}: ${value}`, 'SECURITY');
    });

    logger.log('✅ Application ready to receive requests!');
  });
}
void bootstrap();
