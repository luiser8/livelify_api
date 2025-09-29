# 🔄 Refactorización: Swagger Configuration

## ✅ **Cambios Realizados**

### **1. 📁 Centralización en `swagger.config.ts`**

#### **Antes (main.ts)**
```typescript
// ❌ Configuración dispersa en main.ts
import { SwaggerModule, DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger';

// 50+ líneas de configuración Swagger en main.ts
const config = new DocumentBuilder()
  .setTitle(TITLE)
  .setDescription(DESCRIPTION)
  // ... más configuración
```

#### **Después (swagger.config.ts)**
```typescript
// ✅ Configuración centralizada y organizada
export const isSwaggerEnabled = (): boolean => {
  // Lógica para habilitar/deshabilitar Swagger por ambiente
};

export const swaggerInit = (app: INestApplication) => {
  // Toda la configuración de Swagger aquí
};
```

---

## 🎯 **Estructura Final de Archivos**

### **📄 main.ts** (Limpio y enfocado)
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { swaggerInit } from './swagger.config'; // ✅ Import simple
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Initialize Swagger documentation
  swaggerInit(app); // ✅ Una línea
  
  // Resto de configuración...
}
```

### **📄 swagger.config.ts** (Completo y especializado)
```typescript
/**
 * Check if Swagger should be enabled based on environment
 */
export const isSwaggerEnabled = (): boolean => {
  const swaggerUI = process.env.APP_SWAGGER_UI;
  const environment = process.env.APP_ENV || process.env.NODE_ENV || 'development';
  
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

  const config = new DocumentBuilder()
    .setTitle(TITLE)
    .setDescription(DESCRIPTION)
    .setVersion(VERSION)
    .addServer(`http://localhost:${PORT}/${GLOBAL_PREFIX}`, 'Development server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // ✅ Nombre correcto para @ApiBearerAuth()
    )
    .build();

  const options: SwaggerDocumentOptions = {
    deepScanRoutes: true,
  };

  const document = SwaggerModule.createDocument(app, config, options);

  SwaggerModule.setup(`${GLOBAL_PREFIX}/docs`, app, document, {
    customCssUrl: 'https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.1/themes/3.x/theme-flattop.css',
    customfavIcon: '',
    customSiteTitle: TITLE,
    swaggerOptions: {
      persistAuthorization: true,    // ✅ Mantiene tokens guardados
      tryItOutEnabled: true,         // ✅ Habilita "Try it out"
      displayRequestDuration: true,  // ✅ Muestra duración
    },
  });

  console.log(`📚 Swagger UI: http://localhost:${PORT}/${GLOBAL_PREFIX}/docs`);
};
```

---

## 🎚️ **Control por Ambiente**

### **Variables de Entorno**
```bash
# .env.development
APP_SWAGGER_UI=true    # ✅ Habilitado

# .env.qa
APP_SWAGGER_UI=true    # ✅ Habilitado  

# .env.production
APP_SWAGGER_UI=false   # ❌ Deshabilitado por seguridad
```

### **Lógica de Habilitación**
```typescript
// Desarrollo y QA: Habilitado por defecto
if (environment !== 'production') {
  return swaggerUI !== 'false'; // Solo se deshabilita si es explícitamente 'false'
}

// Producción: Deshabilitado por defecto
if (environment === 'production') {
  return swaggerUI === 'true'; // Solo se habilita si es explícitamente 'true'
}
```

---

## 🔧 **Configuración JWT Swagger**

### **✅ Bearer Auth Configurado Correctamente**
```typescript
.addBearerAuth(
  {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    name: 'JWT',
    description: 'Enter JWT token',
    in: 'header',
  },
  'JWT-auth', // ✅ Nombre que coincide con @ApiBearerAuth('JWT-auth')
)
```

### **✅ Controllers Sincronizados**
```typescript
// auth.controller.ts y user.controller.ts
@ApiBearerAuth('JWT-auth') // ✅ Nombre correcto
export class AuthController {
  // endpoints...
}
```

---

## 🎨 **Características UI Mejoradas**

### **✅ Tema Personalizado**
```typescript
customCssUrl: 'https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.1/themes/3.x/theme-flattop.css'
```

### **✅ Opciones de Usuario**
```typescript
swaggerOptions: {
  persistAuthorization: true,    // Mantiene el token JWT guardado
  tryItOutEnabled: true,         // Habilita botón "Try it out"
  displayRequestDuration: true,  // Muestra tiempo de respuesta
}
```

### **✅ Servidor Configurado**
```typescript
.addServer(`http://localhost:${PORT}/${GLOBAL_PREFIX}`, 'Development server')
```

---

## 🚀 **Beneficios de la Refactorización**

### **📂 Organización**
- ✅ **Separación de responsabilidades**: Swagger en su propio archivo
- ✅ **main.ts limpio**: Solo bootstrapping esencial
- ✅ **Reutilizable**: `swagger.config.ts` se puede usar en otros proyectos

### **🔧 Mantenibilidad**
- ✅ **Fácil modificación**: Todos los cambios de Swagger en un lugar
- ✅ **Documentación clara**: Funciones bien documentadas
- ✅ **Type safety**: Tipado completo de configuraciones

### **🌍 Control por Ambiente**
- ✅ **Seguridad en producción**: Swagger deshabilitado por defecto
- ✅ **Desarrollo amigable**: Habilitado automáticamente en dev/qa
- ✅ **Configuración flexible**: Variables de entorno para control

### **🎯 Experiencia de Usuario**
- ✅ **Autorización persistente**: No pierde el token al recargar
- ✅ **Tema visual mejorado**: CSS personalizado
- ✅ **URLs completas**: Servidor base configurado correctamente

---

## 🎉 **Resultado Final**

### **🔗 URLs Disponibles**
```bash
# Desarrollo
http://localhost:3000/api/v1/docs

# QA
http://qa-server:3000/api/v1/docs

# Producción
# Swagger deshabilitado por defecto
```

### **🔐 Flujo de Autenticación**
1. **POST** `/auth/login` → Obtener `access_token`
2. **Click** "Authorize" 🔒 en Swagger
3. **Pegar** token (sin "Bearer ")
4. **Usar** cualquier endpoint protegido ✅

### **🛠️ Logs Informativos**
```bash
🚀 Livelify API started successfully!
📍 API: http://localhost:3000/api/v1
📚 Docs: http://localhost:3000/api/v1/docs
🌍 Environment: development
📚 Swagger UI: http://localhost:3000/api/v1/docs
```

**✅ ¡Swagger completamente refactorizado y centralizado en `swagger.config.ts`!**
