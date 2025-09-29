import { INestApplication } from '@nestjs/common';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerDocumentOptions,
} from '@nestjs/swagger';

/**
 * Check if Swagger should be enabled based on environment
 */
export const isSwaggerEnabled = (): boolean => {
  const swaggerUI = process.env.APP_SWAGGER_UI;
  const environment =
    process.env.APP_ENV || process.env.NODE_ENV || 'development';

  // Swagger disabled in production by default unless explicitly enabled
  if (environment === 'production') {
    return swaggerUI === 'true';
  }

  // Enabled in development and QA by default unless explicitly disabled
  return swaggerUI !== 'false';
};

/**
 * Initialize Swagger documentation
 */
export const swaggerInit = (app: INestApplication) => {
  if (!isSwaggerEnabled()) {
    console.log('📚 Swagger UI: Disabled in this environment');
    return;
  }
  const PORT = +(process.env.APP_PORT ?? 3000);
  const PREFIX = process.env.APP_PREFIX ?? '';
  const VERSION = process.env.APP_VERSION ?? 'v1';
  const GLOBAL_PREFIX = PREFIX ? `${PREFIX}/${VERSION}` : VERSION;
  const TITLE = process.env.APP_TITLE ?? 'Livelify API';
  const DESCRIPTION = process.env.APP_DESCRIPTION ?? 'API documentation';

  const config = new DocumentBuilder()
    .setTitle(TITLE)
    .setDescription(DESCRIPTION)
    .setVersion(VERSION)
    .addServer(
      `http://localhost:${PORT}/${GLOBAL_PREFIX}`,
      'Development server',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const options: SwaggerDocumentOptions = {
    deepScanRoutes: true,
  };

  const document = SwaggerModule.createDocument(app, config, options);

  SwaggerModule.setup(`${GLOBAL_PREFIX}/docs`, app, document, {
    customCssUrl:
      'https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.1/themes/3.x/theme-flattop.css',
    customfavIcon: '',
    customSiteTitle: TITLE,
    swaggerOptions: {
      persistAuthorization: true,
      tryItOutEnabled: true,
      displayRequestDuration: true,
    },
  });

  console.log(`📚 Swagger UI: http://localhost:${PORT}/${GLOBAL_PREFIX}/docs`);
};
