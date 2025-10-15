# 🚀 Deployment a Producción - Resumen Ejecutivo

## ⚡ TL;DR - Proceso Rápido

### Para aplicar estos cambios a producción:

```bash
# 1. Hacer BACKUP de la base de datos (CRÍTICO)
# Ver comandos específicos abajo

# 2. Aplicar migración en producción
APP_ENV=production npx prisma migrate deploy

# 3. Desplegar nuevo código
git push origin main  # Trigger Cloud Build automáticamente

# 4. Verificar que todo funciona
curl https://api.livelify.com/health/readiness
```

---

## 📊 ¿Qué Hemos Cambiado?

### Base de Datos (Tablas)
- ✅ `SubscriptionPlan`: Agregados campos de pricing detallado
- ✅ `UserSubscription`: Agregados campos de pago y fechas
- ✅ Nuevos enums: `PaymentMethod`, `PaymentProvider`

### Código (API)
- ✅ DTOs actualizados
- ✅ Controladores actualizados
- ✅ Use cases actualizados
- ✅ Repositorios actualizados

---

## 🎯 Proceso de Deployment Paso a Paso

### 1️⃣ Desarrollo (YA HECHO ✅)

```bash
✅ Schema actualizado
✅ Migración creada: 20251011210323_
✅ Código actualizado
✅ Build exitoso
✅ Ready para QA
```

### 2️⃣ QA/Staging (HACER PRIMERO)

```bash
# En servidor QA
cd /path/to/livelify_api
git pull origin develop

# Aplicar migración
APP_ENV=qa pnpm run prisma:deploy:qa

# Verificar
npx prisma migrate status

# Probar endpoints
curl https://qa-api.livelify.com/subscription/all
```

### 3️⃣ Producción (DESPUÉS DE QA)

#### A. Backup (OBLIGATORIO)

**Opción 1: Cloud SQL (GCP)**
```bash
gcloud sql backups create \
  --instance=livelify-prod \
  --description="Pre-migration: subscription models update"
```

**Opción 2: PostgreSQL Local**
```bash
pg_dump -h <host> -U <user> -d livelify \
  -F c -f backup_$(date +%Y%m%d_%H%M%S).dump
```

**Opción 3: RDS (AWS)**
```bash
aws rds create-db-snapshot \
  --db-instance-identifier livelify-prod \
  --db-snapshot-identifier pre-migration-$(date +%Y%m%d)
```

#### B. Aplicar Migración

**Opción A: Script Automatizado (Recomendado)**
```bash
# El script hace verificaciones de seguridad
chmod +x scripts/migrate-production.sh
APP_ENV=production ./scripts/migrate-production.sh
```

**Opción B: Manual**
```bash
APP_ENV=production npx prisma migrate deploy
```

#### C. Deploy de Código

**Opción A: Cloud Build (Automático)**
```bash
git checkout main
git merge develop
git push origin main

# Cloud Build automáticamente:
# 1. Build Docker image
# 2. Run prisma generate
# 3. Deploy to Cloud Run
# 4. Ejecuta start-production.sh que aplica migraciones
```

**Opción B: Manual**
```bash
cd /path/to/livelify_api
git pull origin main
pnpm install
pnpm run build
APP_ENV=production pnpm run prisma:deploy:prod
pm2 restart livelify_api
```

#### D. Verificación

```bash
# 1. Estado de migraciones
npx prisma migrate status

# 2. Health checks
curl https://api.livelify.com/health/liveness
curl https://api.livelify.com/health/readiness

# 3. Endpoint de subscriptions
curl https://api.livelify.com/subscription/all

# 4. Logs
# Ver que no haya errores en los últimos minutos
```

---

## ⚠️ IMPORTANTE: Si Ya Tienes Datos en Producción

Si tu base de datos de producción ya tiene planes de suscripción con los valores antiguos (`BASICO`, `INTERMEDIO`, `AVANZADO`), la migración **FALLARÁ**.

### Solución: Migración de Datos Primero

Necesitas ejecutar este SQL antes de la migración:

```sql
-- 1. Agregar nuevos valores al enum
ALTER TYPE "PlanType" ADD VALUE IF NOT EXISTS 'MONTHLY';
ALTER TYPE "PlanType" ADD VALUE IF NOT EXISTS 'QUARTERLY';
ALTER TYPE "PlanType" ADD VALUE IF NOT EXISTS 'SEMESTER';
ALTER TYPE "PlanType" ADD VALUE IF NOT EXISTS 'ANNUAL';

-- 2. Migrar datos existentes
UPDATE "SubscriptionPlan" 
SET "name" = 'MONTHLY' 
WHERE "name" = 'BASICO';

UPDATE "SubscriptionPlan" 
SET "name" = 'QUARTERLY' 
WHERE "name" = 'INTERMEDIO';

UPDATE "SubscriptionPlan" 
SET "name" = 'ANNUAL' 
WHERE "name" = 'AVANZADO';

-- 3. Agregar datos temporales para las nuevas columnas
ALTER TABLE "SubscriptionPlan" ADD COLUMN IF NOT EXISTS "basePrice" DOUBLE PRECISION;
ALTER TABLE "SubscriptionPlan" ADD COLUMN IF NOT EXISTS "pricePerMonth" DOUBLE PRECISION;
ALTER TABLE "SubscriptionPlan" ADD COLUMN IF NOT EXISTS "billingCycle" INTEGER;
ALTER TABLE "SubscriptionPlan" ADD COLUMN IF NOT EXISTS "bestFor" TEXT;

-- Migrar del campo price a los nuevos
UPDATE "SubscriptionPlan" 
SET 
  "basePrice" = "price",
  "pricePerMonth" = "price",
  "billingCycle" = CASE
    WHEN "name" = 'MONTHLY' THEN 1
    WHEN "name" = 'QUARTERLY' THEN 3
    WHEN "name" = 'SEMESTER' THEN 6
    WHEN "name" = 'ANNUAL' THEN 12
    ELSE 1
  END,
  "bestFor" = CASE
    WHEN "name" = 'MONTHLY' THEN 'Mensual'
    WHEN "name" = 'QUARTERLY' THEN 'Trimestral'
    WHEN "name" = 'SEMESTER' THEN 'Semestral'
    WHEN "name" = 'ANNUAL' THEN 'Anual'
    ELSE 'Mensual'
  END
WHERE "basePrice" IS NULL;

-- 4. Ahora sí aplicar la migración
-- npx prisma migrate deploy
```

---

## 📝 Checklist de Deployment

### Pre-Deployment
- [ ] Cambios probados en desarrollo
- [ ] Cambios probados en QA
- [ ] Código en branch `main`
- [ ] **BACKUP de base de datos realizado** ⚠️
- [ ] Plan de rollback preparado
- [ ] Equipo notificado

### Durante Deployment
- [ ] Migración aplicada sin errores
- [ ] Código desplegado
- [ ] Health checks pasando
- [ ] Endpoints funcionando

### Post-Deployment
- [ ] Verificar logs sin errores
- [ ] Monitorear por 1 hora
- [ ] Guardar backup por 7 días
- [ ] Notificar éxito al equipo

---

## 🔄 Plan de Rollback

Si algo sale mal:

### 1. Rollback de Código (Preferido)
```bash
git revert <commit-hash>
git push origin main
# Redesplegar
```

### 2. Rollback de Base de Datos (Solo si es crítico)
```bash
# Restaurar desde backup
pg_restore -d livelify backup_XXXXXX.dump

# O desde Cloud SQL
gcloud sql backups restore <backup-id> \
  --backup-instance=livelify-prod
```

---

## 📁 Archivos Creados para Ti

1. **`docs/PRODUCTION_DEPLOYMENT_GUIDE.md`**
   - Guía completa y detallada
   - Todos los escenarios
   - Troubleshooting

2. **`scripts/migrate-production.sh`**
   - Script automatizado de migración
   - Con verificaciones de seguridad
   - Confirmaciones múltiples

3. **`scripts/start-production.sh`**
   - Script de inicio para Docker
   - Aplica migraciones automáticamente
   - Para usar con Cloud Run/Docker

4. **`docs/DATABASE_SCRIPTS.md`**
   - Scripts de npm disponibles
   - Comandos de Prisma
   - Referencias rápidas

---

## 🚨 Reglas de Oro

1. ❌ **NUNCA** `prisma migrate reset` en producción
2. ✅ **SIEMPRE** hacer backup antes de migrar
3. ❌ **NUNCA** ejecutar seed en producción
4. ✅ **SIEMPRE** probar en QA primero
5. ✅ **SIEMPRE** tener plan de rollback

---

## 💡 Tips Pro

### Ejecutar en Horario de Bajo Tráfico
```bash
# Ejemplo: Madrugada
# Programar deployment para 2:00 AM
```

### Monitoreo Post-Deployment
```bash
# Logs en vivo
tail -f /var/log/livelify_api.log

# O con PM2
pm2 logs livelify_api --lines 100

# O Docker
docker logs -f <container-id>
```

### Verificación Rápida
```bash
# Script de smoke tests
curl -s https://api.livelify.com/health/readiness | jq
curl -s https://api.livelify.com/subscription/all | jq
```

---

## 🆘 Soporte

Si tienes problemas durante el deployment:

1. **NO PÁNICO** 🧘
2. Revisar logs
3. Verificar estado de migración: `npx prisma migrate status`
4. Consultar: `docs/PRODUCTION_DEPLOYMENT_GUIDE.md`
5. Contactar al equipo de DevOps

---

## ✅ Resumen

**Lo que necesitas hacer:**

1. Probar en QA ✅
2. Hacer BACKUP ⚠️
3. Ejecutar: `APP_ENV=production ./scripts/migrate-production.sh`
4. Desplegar código: `git push origin main`
5. Verificar que todo funcione ✅

**Tiempo estimado:** 15-30 minutos

**Riesgo:** Bajo (con backup)

**Impacto:** Mejora en funcionalidad de subscriptions

---

¿Preguntas? Consulta la documentación completa en `docs/PRODUCTION_DEPLOYMENT_GUIDE.md`

🚀 **¡Éxito en tu deployment!**

