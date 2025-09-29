# Configuración Multi-Ambiente para Prisma

## 🎯 Objetivo

Configurar Prisma para trabajar con múltiples ambientes (development, qa, production) usando un solo archivo `schema.prisma` pero con conexiones de base de datos dinámicas según el ambiente.

## 🏗️ Arquitectura de la Solución

### Un Solo Schema, Múltiples Conexiones

```
prisma/
├── schema.prisma          # ✅ Un único schema para todos los ambientes
├── seed.ts               # ✅ Seed que detecta el ambiente automáticamente
└── migrations/           # ✅ Migraciones compartidas

src/
└── app.module.ts         # ✅ Carga dinámica del archivo .env correcto
```

### Archivos de Ambiente Específicos

```
.env.development          # ✅ Variables para desarrollo
.env.qa                   # ✅ Variables para QA/testing
.env.production           # ✅ Variables para producción
```

## 📋 Configuración Paso a Paso

### 1. Preparar Archivos de Ambiente

Copia los archivos de ejemplo y configúralos:

```bash
# Copiar archivos de ejemplo
npm run env:copy:all

# O manualmente:
cp env.development.example .env.development
cp env.qa.example .env.qa
cp env.production.example .env.production
```

### 2. Configurar Variables de Cada Ambiente

#### `.env.development`
```env
DATABASE_URL="postgresql://livelify_user:livelify_password@localhost:5432/livelify_dev"
JWT_SECRET="dev-jwt-secret-key"
API_PORT=3000
LOG_LEVEL="debug"
```

#### `.env.qa`
```env
DATABASE_URL="postgresql://livelify_user:livelify_password@localhost:5433/livelify_qa"
JWT_SECRET="qa-jwt-secret-key"
API_PORT=3001
LOG_LEVEL="info"
```

#### `.env.production`
```env
DATABASE_URL="postgresql://prod_user:prod_password@prod_host:5432/livelify_production"
JWT_SECRET="your-very-secure-jwt-secret"
API_PORT=3000
LOG_LEVEL="warn"
```

## 🚀 Uso de Scripts por Ambiente

### Aplicación

```bash
# Desarrollo
npm run start:dev          # APP_ENV=development nest start --watch

# QA
npm run start:qa           # APP_ENV=qa nest start --watch

# Producción
npm run start:prod         # APP_ENV=production node dist/main
```

### Base de Datos

#### Generar Cliente Prisma
```bash
npm run prisma:generate:dev     # Para development
npm run prisma:generate:qa      # Para qa
npm run prisma:generate:prod    # Para production
```

#### Migraciones
```bash
npm run prisma:migrate:dev      # Migración en development
npm run prisma:migrate:qa       # Migración en qa
npm run prisma:migrate:prod     # Deploy en production (sin prompts)
```

#### Prisma Studio
```bash
npm run prisma:studio:dev       # Studio para development
npm run prisma:studio:qa        # Studio para qa
npm run prisma:studio:prod      # Studio para production
```

#### Seed
```bash
npm run prisma:seed:dev         # Seed en development
npm run prisma:seed:qa          # Seed en qa
```

#### Setup Completo (Recomendado para nuevos ambientes)
```bash
npm run db:setup:dev           # Generate + Migrate + Seed para development
npm run db:setup:qa            # Generate + Migrate + Seed para qa
npm run db:setup:prod          # Generate + Deploy para production
```

## 🔧 Cómo Funciona

### 1. Detección Automática del Ambiente

```typescript
// src/app.module.ts
function getEnvFilePath(): string {
  const environment = process.env.APP_ENV || process.env.NODE_ENV || 'development';
  console.log(`🌍 Loading environment: ${environment}`);
  console.log(`📁 Environment file: .env.${environment}`);
  return `.env.${environment}`;
}
```

### 2. Schema Único con DATABASE_URL Dinámico

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  # ✅ Se resuelve dinámicamente
}
```

### 3. Scripts con Variable de Ambiente

```json
{
  "prisma:migrate:dev": "APP_ENV=development prisma migrate dev",
  "prisma:migrate:qa": "APP_ENV=qa prisma migrate dev",
  "prisma:migrate:prod": "APP_ENV=production prisma migrate deploy"
}
```

## 🎯 Ventajas de Esta Solución

### ✅ Un Solo Schema
- **Consistencia**: Un único archivo `schema.prisma` para todos los ambientes
- **Mantenimiento**: Cambios de schema se aplican a todos los ambientes
- **Simplicidad**: No hay archivos duplicados que mantener sincronizados

### ✅ Configuración Dinámica
- **Flexibilidad**: Cada ambiente puede tener su propia configuración
- **Seguridad**: Secrets diferentes por ambiente
- **Escalabilidad**: Fácil agregar nuevos ambientes

### ✅ Scripts Específicos
- **Automatización**: Scripts npm específicos para cada ambiente
- **Prevención de errores**: No hay confusión sobre qué ambiente usar
- **CI/CD friendly**: Scripts claros para pipelines de deployment

## 🚨 Buenas Prácticas

### Desarrollo Local
```bash
# Siempre usar los scripts específicos de ambiente
npm run start:dev              # ✅ Correcto
npm run prisma:migrate:dev     # ✅ Correcto

# Evitar comandos genéricos
npm start                      # ❌ No especifica ambiente
prisma migrate dev             # ❌ Podría usar ambiente incorrecto
```

### Producción
```bash
# Usar deploy en lugar de migrate dev
npm run prisma:migrate:prod    # ✅ Usa migrate deploy (seguro)
npm run prisma:migrate:dev     # ❌ No usar en producción
```

### Verificación de Ambiente
```bash
# Siempre verificar que se está usando el ambiente correcto
echo $APP_ENV                  # Debe mostrar el ambiente esperado
```

## 🔍 Debugging

### Verificar Carga de Variables
```bash
# Temporal: agregar logs en app.module.ts para ver qué archivo se carga
# Los logs aparecerán al iniciar la aplicación:
# 🌍 Loading environment: development
# 📁 Environment file: .env.development
```

### Verificar Conexión de DB
```bash
# Usar Prisma Studio para verificar conexión
npm run prisma:studio:dev      # Para development
npm run prisma:studio:qa       # Para qa
```

### Variables de Ambiente
```bash
# Verificar que las variables se cargan correctamente
node -e "console.log(process.env.DATABASE_URL)"
```

## 📚 Ejemplos de Uso

### Configuración Inicial
```bash
# 1. Copiar archivos de ejemplo
npm run env:copy:all

# 2. Configurar base de datos para development
npm run db:setup:dev

# 3. Iniciar aplicación en development
npm run start:dev
```

### Preparar QA
```bash
# 1. Configurar base de datos para QA
npm run db:setup:qa

# 2. Iniciar aplicación en QA
npm run start:qa
```

### Deploy a Producción
```bash
# 1. Build de la aplicación
npm run build

# 2. Deploy de migraciones (sin seed)
npm run db:setup:prod

# 3. Iniciar aplicación en producción
npm run start:prod
```

## 🎉 Resumen

Esta configuración te permite:

1. **Mantener un solo `schema.prisma`** para todos los ambientes
2. **Usar conexiones de base de datos diferentes** por ambiente
3. **Tener configuraciones específicas** por ambiente
4. **Scripts npm claros y seguros** para cada operación
5. **Detección automática del ambiente** basada en `APP_ENV`

Todo esto sin duplicar archivos y manteniendo la simplicidad y flexibilidad que necesitas para un proyecto profesional.
