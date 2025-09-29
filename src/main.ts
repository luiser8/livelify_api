/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { swaggerInit } from './swagger.config';
import { configureSecurityHeaders, getSecurityInfo } from './security.config';
import { ValidationPipe } from '@nestjs/common';

const PORT = +(process.env.APP_PORT ?? 3000);
const PREFIX = process.env.APP_PREFIX ?? '';
const VERSION = process.env.APP_VERSION ?? 'v1';
const GLOBAL_PREFIX = PREFIX ? `${PREFIX}/${VERSION}` : VERSION;
const SECURITY_ALLOWED_ORIGINS = process.env.APP_ALLOWED_ORIGINS;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
  await app.listen(PORT, () => {
    console.log(`\n🚀 \x1B[32mLivelify API\x1B[0m started successfully!`);
    console.log(
      `📍 API: \x1B[36mhttp://localhost:${PORT}/${GLOBAL_PREFIX}\x1B[0m`,
    );
    console.log(
      `📚 Docs: \x1B[36mhttp://localhost:${PORT}/${GLOBAL_PREFIX}/docs\x1B[0m`,
    );
    console.log(
      `🌍 Environment: \x1B[33m${process.env.APP_ENV || 'development'}\x1B[0m`,
    );

    // 🔒 Security Information
    const securityInfo = getSecurityInfo();
    console.log('\n🔒 Security Features:');
    Object.entries(securityInfo).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
  });
}
void bootstrap();
