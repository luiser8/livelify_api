# 🚀 Guía de Deployment a Producción - Migraciones de Base de Datos

## ⚠️ REGLAS DE ORO PARA PRODUCCIÓN

1. **NUNCA** ejecutar `prisma migrate reset` en producción
2. **SIEMPRE** hacer backup antes de migrar
3. **NUNCA** ejecutar seed en producción (los datos ya existen)
4. **PROBAR** primero en QA/Staging
5. **TENER** un plan de rollback
6. **APLICAR** en horario de bajo tráfico
7. **MONITOREAR** después del deployment

---

## 📋 Proceso Completo de Deployment

### Fase 1: Preparación (Desarrollo)

#### 1.1 Crear y Probar Migración en Desarrollo

```bash
# En tu máquina local
cd /path/to/livelify_api

# Editar schema si es necesario
# vim prisma/schema.prisma

# Crear migración
pnpm run prisma:migrate:dev

# Esto crea: prisma/migrations/YYYYMMDDHHMMSS_nombre/migration.sql
```

#### 1.2 Verificar la Migración

```bash
# Ver el contenido de la migración
cat prisma/migrations/20251011210323_/migration.sql

# Verificar que:
# - No hay DROP TABLE (a menos que sea intencional)
# - No hay DELETE masivos
# - Los ALTER TABLE son seguros
# - Hay valores DEFAULT para columnas nuevas requeridas
```

#### 1.3 Probar con Datos Reales

```bash
# Crear datos de prueba similares a producción
pnpm run prisma:seed:dev

# Probar que la aplicación funciona
pnpm run start:dev

# Probar endpoints afectados
# - GET /subscription/all
# - POST /users/add-subscription
# - etc.
```

#### 1.4 Commit y Push

```bash
# Agregar migración al repositorio
git add prisma/migrations/
git add prisma/schema.prisma
git add src/  # Código actualizado
git commit -m "feat: update subscription models with detailed pricing"
git push origin develop
```

---

### Fase 2: Testing en QA/Staging

#### 2.1 Deploy a QA

```bash
# En servidor QA (después de pull/deploy)
cd /path/to/livelify_api

# Asegurar que tenemos las variables de entorno correctas
export APP_ENV=qa

# Aplicar migración
pnpm run prisma:deploy:qa

# O manualmente
npx prisma migrate deploy
```

#### 2.2 Verificar en QA

```bash
# Ver estado de migraciones
npx prisma migrate status

# Verificar tablas
pnpm run prisma:studio:qa
```

#### 2.3 Testing en QA

- ✅ Probar todos los endpoints de subscription
- ✅ Verificar que datos existentes no se corrompieron
- ✅ Probar creación de nuevas subscriptions
- ✅ Probar actualización de subscriptions
- ✅ Verificar logs de la aplicación

---

### Fase 3: Deployment a Producción

#### 3.1 Pre-Deployment Checklist

```bash
# ✅ Migración probada en QA
# ✅ Código revisado y aprobado
# ✅ Backup de base de datos programado
# ✅ Plan de rollback documentado
# ✅ Ventana de mantenimiento comunicada (si es necesario)
# ✅ Equipo de soporte notificado
# ✅ Monitoreo preparado
```

#### 3.2 Backup de Base de Datos (CRÍTICO)

```bash
# Opción 1: Backup con pg_dump
pg_dump -h <host> -U <user> -d livelify -F c -f backup_pre_migration_$(date +%Y%m%d_%H%M%S).dump

# Opción 2: Backup en Cloud SQL (GCP)
gcloud sql backups create \
  --instance=livelify-prod \
  --description="Backup antes de migración subscription models"

# Opción 3: Backup en RDS (AWS)
aws rds create-db-snapshot \
  --db-instance-identifier livelify-prod \
  --db-snapshot-identifier pre-migration-$(date +%Y%m%d-%H%M%S)

# Verificar que el backup se completó correctamente
```

#### 3.3 Deployment de Código

##### Opción A: Con Cloud Build (GCP)

```bash
# El cloudbuild.yaml ya maneja el deployment
git checkout main
git merge develop
git push origin main

# Cloud Build automáticamente:
# 1. Construye la imagen Docker
# 2. Ejecuta prisma generate
# 3. Despliega a Cloud Run
# 4. La migración se ejecuta al iniciar el contenedor
```

##### Opción B: Manual

```bash
# En servidor de producción
cd /path/to/livelify_api

# Pull del código
git pull origin main

# Instalar dependencias
pnpm install

# Generar cliente Prisma
APP_ENV=production pnpm run prisma:generate:prod

# IMPORTANTE: NO ejecutar seed en producción
# Build de la aplicación
pnpm run build

# Aplicar migraciones (SIN reset, SIN seed)
APP_ENV=production pnpm run prisma:deploy:prod

# O directamente
APP_ENV=production npx prisma migrate deploy

# Reiniciar aplicación
pm2 restart livelify_api
# o
systemctl restart livelify_api
```

#### 3.4 Verificación Post-Deployment

```bash
# 1. Verificar estado de migraciones
APP_ENV=production npx prisma migrate status

# Esperado: "Database schema is up to date!"

# 2. Verificar logs de la aplicación
# - Buscar errores relacionados con base de datos
# - Verificar que la app inició correctamente

# 3. Smoke tests
curl https://api.livelify.com/health/liveness
curl https://api.livelify.com/health/readiness
curl https://api.livelify.com/subscription/all

# 4. Verificar datos existentes
# - Entrar a la base de datos
# - Verificar que las tablas tienen los nuevos campos
# - Verificar que los datos antiguos siguen intactos
```

---

## 🔧 Configuración de Docker/Cloud Build

### Dockerfile - Ya está Configurado ✅

Tu `Dockerfile` ya incluye los pasos correctos:

```dockerfile
# Copiar Prisma schema
COPY prisma ./prisma/

# Generar cliente Prisma
RUN pnpm prisma generate

# No incluye migrate (se hace en tiempo de ejecución)
```

### Ejecutar Migración en Contenedor

Tienes dos opciones:

#### Opción 1: Migración al iniciar el contenedor

Modificar el script de inicio para incluir migración:

```bash
# Crear scripts/start-production.sh
#!/bin/bash
set -e

echo "🔄 Aplicando migraciones..."
npx prisma migrate deploy

echo "🚀 Iniciando aplicación..."
node dist/main.js
```

Y en `Dockerfile`:

```dockerfile
CMD ["sh", "scripts/start-production.sh"]
```

#### Opción 2: Job separado de migración

Ejecutar migración antes de desplegar nuevos contenedores:

```bash
# Job de migración (Cloud Run Job o similar)
npx prisma migrate deploy

# Luego desplegar la nueva versión
```

---

## 🔄 Plan de Rollback

### Si algo sale mal después de la migración:

#### Opción 1: Rollback de Código (Preferido)

```bash
# Revertir al commit anterior
git revert <commit-hash>
git push origin main

# Redesplegar versión anterior
# La base de datos mantiene los nuevos campos (no causa problemas)
```

#### Opción 2: Rollback de Base de Datos (Último Recurso)

```bash
# Restaurar desde backup
pg_restore -h <host> -U <user> -d livelify backup_pre_migration_XXXXXX.dump

# O desde Cloud SQL
gcloud sql backups restore <backup-id> \
  --backup-instance=livelify-prod \
  --backup-project=<project-id>

# IMPORTANTE: Después de restaurar DB, también restaurar código anterior
```

---

## 📊 Migraciones Específicas de Este Proyecto

### Migración Actual: `20251011210323_`

#### Cambios Aplicados:

1. **Nuevos Enums:**
   - `PaymentMethod`: CREDIT_CARD, PAYPAL, BANK_TRANSFER
   - `PaymentProvider`: STRIPE, MERCADO_PAGO, OTHER

2. **SubscriptionPlan - Campos Agregados:**
   - `basePrice` (requerido)
   - `pricePerMonth` (requerido)
   - `billingCycle` (requerido)
   - `bestFor` (requerido)
   - `savings` (opcional)
   - `discount` (opcional)

3. **SubscriptionPlan - Cambios:**
   - Eliminado: `price`
   - PlanType: BASICO, INTERMEDIO, AVANZADO → MONTHLY, QUARTERLY, SEMESTER, ANNUAL

4. **UserSubscription - Campos Agregados:**
   - `currencyId` (requerido, FK a Currency)
   - `endDate` (requerido)
   - `autoRenew` (default: true)
   - `amountPaid` (opcional)
   - `paymentMethod` (opcional)
   - `paymentProvider` (opcional)
   - `renewalDate` ahora es opcional

#### ⚠️ Consideraciones Importantes:

**Para Producción con Datos Existentes:**

Si ya hay datos en producción, esta migración **FALLARÁ** porque:

1. ❌ Intenta cambiar enum `PlanType` (elimina BASICO, INTERMEDIO, AVANZADO)
2. ❌ Agrega columnas requeridas sin valores default

#### 🛠️ Solución: Migración en Dos Pasos

Si ya tienes datos en producción, necesitas crear una migración más segura:

##### Paso 1: Agregar campos como opcionales

```sql
-- Agregar columnas como opcionales primero
ALTER TABLE "SubscriptionPlan" 
  ADD COLUMN "basePrice" DOUBLE PRECISION,
  ADD COLUMN "pricePerMonth" DOUBLE PRECISION,
  ADD COLUMN "billingCycle" INTEGER,
  ADD COLUMN "bestFor" TEXT,
  ADD COLUMN "savings" DOUBLE PRECISION,
  ADD COLUMN "discount" DOUBLE PRECISION;

-- Migrar datos del campo price a los nuevos campos
UPDATE "SubscriptionPlan" 
SET 
  "basePrice" = "price",
  "pricePerMonth" = "price",
  "billingCycle" = 1,
  "bestFor" = "name"
WHERE "basePrice" IS NULL;

-- Ahora hacer requeridos los campos
ALTER TABLE "SubscriptionPlan" 
  ALTER COLUMN "basePrice" SET NOT NULL,
  ALTER COLUMN "pricePerMonth" SET NOT NULL,
  ALTER COLUMN "billingCycle" SET NOT NULL,
  ALTER COLUMN "bestFor" SET NOT NULL;

-- Finalmente eliminar el campo antiguo
ALTER TABLE "SubscriptionPlan" DROP COLUMN "price";
```

##### Paso 2: Actualizar PlanType

```sql
-- Agregar nuevos valores al enum
ALTER TYPE "PlanType" ADD VALUE 'MONTHLY';
ALTER TYPE "PlanType" ADD VALUE 'QUARTERLY';
ALTER TYPE "PlanType" ADD VALUE 'SEMESTER';
ALTER TYPE "PlanType" ADD VALUE 'ANNUAL';

-- Migrar datos existentes
UPDATE "SubscriptionPlan" 
SET "name" = 'MONTHLY' 
WHERE "name" = 'BASICO';

UPDATE "SubscriptionPlan" 
SET "name" = 'QUARTERLY' 
WHERE "name" = 'INTERMEDIO';

UPDATE "SubscriptionPlan" 
SET "name" = 'ANNUAL' 
WHERE "name" = 'AVANZADO';

-- No se pueden eliminar valores del enum fácilmente en PostgreSQL
-- Dejar los valores antiguos o recrear el enum
```

---

## 🎯 Scripts para Producción

### Script de Migración Segura

```bash
#!/bin/bash
# scripts/migrate-production.sh

set -e  # Exit on error

echo "🔍 Verificando conexión a base de datos..."
npx prisma db pull --schema=./prisma/schema.prisma || exit 1

echo "📊 Verificando estado actual de migraciones..."
npx prisma migrate status

echo "⚠️  Este script aplicará migraciones a PRODUCCIÓN"
echo "¿Has hecho backup de la base de datos? (yes/no)"
read -r response

if [ "$response" != "yes" ]; then
    echo "❌ Deployment cancelado. Por favor hacer backup primero."
    exit 1
fi

echo "🔄 Aplicando migraciones..."
npx prisma migrate deploy

echo "✅ Migraciones aplicadas exitosamente"

echo "🔍 Verificando estado final..."
npx prisma migrate status

echo "✨ Deployment completado"
```

### Uso del Script

```bash
chmod +x scripts/migrate-production.sh
APP_ENV=production ./scripts/migrate-production.sh
```

---

## 📝 Checklist de Deployment Completo

### Pre-Deployment

- [ ] Migración probada en desarrollo
- [ ] Migración probada en QA
- [ ] Código revisado (PR aprobado)
- [ ] Tests pasando
- [ ] Backup de producción realizado
- [ ] Plan de rollback documentado
- [ ] Ventana de mantenimiento comunicada (si aplica)
- [ ] Variables de entorno verificadas

### Durante Deployment

- [ ] Aplicar migración en producción
- [ ] Desplegar nuevo código
- [ ] Verificar logs sin errores
- [ ] Ejecutar smoke tests
- [ ] Verificar endpoints críticos
- [ ] Monitorear métricas

### Post-Deployment

- [ ] Confirmar que migración se aplicó
- [ ] Verificar datos en base de datos
- [ ] Monitorear errores durante 1 hora
- [ ] Actualizar documentación
- [ ] Notificar al equipo de éxito
- [ ] Mantener backup por 7 días

---

## 🚨 Escenarios de Emergencia

### La Aplicación No Inicia

```bash
# 1. Revisar logs
docker logs <container-id>
pm2 logs livelify_api

# 2. Verificar conexión a DB
psql -h <host> -U <user> -d livelify

# 3. Verificar estado de migración
npx prisma migrate status

# 4. Rollback si es necesario
git revert <commit>
# Redesplegar
```

### Errores en Base de Datos

```bash
# 1. Identificar el error en logs
# 2. Si es error de migración, verificar:
npx prisma migrate status

# 3. Si migración está a medias:
# NO intentar aplicar de nuevo automáticamente
# Revisar manualmente qué se aplicó

# 4. Contactar DBA o equipo senior
```

---

## 📖 Recursos Adicionales

- [Prisma Deploy Best Practices](https://www.prisma.io/docs/guides/deployment/deploy-database-changes)
- [PostgreSQL Backup/Restore](https://www.postgresql.org/docs/current/backup.html)
- Docs internos: `/docs/DATABASE_SCRIPTS.md`

---

**Última Actualización**: 11 de Octubre, 2025  
**Versión**: 1.0  
**Autor**: DevOps Team

