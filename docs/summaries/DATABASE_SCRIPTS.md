# 🗄️ Scripts de Base de Datos - Guía de Referencia

## 📋 Resumen de la Actualización

Se han actualizado los modelos `SubscriptionPlan` y `UserSubscription` en el schema de Prisma con los siguientes cambios:

### ✅ Migración Aplicada: `20251011210323_`

#### SubscriptionPlan - Nuevos Campos
- `basePrice`: Precio base del período
- `pricePerMonth`: Precio calculado por mes
- `savings`: Ahorro comparado con plan mensual
- `discount`: Porcentaje de descuento
- `billingCycle`: Duración en meses (1, 3, 6, 12)
- `bestFor`: Descripción del plan

#### UserSubscription - Nuevos Campos
- `currencyId`: ID de la moneda (foreign key)
- `endDate`: Fecha de finalización de la suscripción
- `autoRenew`: Auto-renovación activada/desactivada
- `amountPaid`: Monto realmente pagado
- `paymentMethod`: Método de pago (CREDIT_CARD, PAYPAL, BANK_TRANSFER)
- `paymentProvider`: Proveedor de pago (STRIPE, MERCADO_PAGO, OTHER)

#### Enums Nuevos
- `PaymentMethod`: CREDIT_CARD, PAYPAL, BANK_TRANSFER
- `PaymentProvider`: STRIPE, MERCADO_PAGO, OTHER

#### PlanType Actualizado
- ❌ Removido: BASICO, INTERMEDIO, AVANZADO
- ✅ Agregado: MONTHLY, QUARTERLY, SEMESTER, ANNUAL

---

## 🚀 Scripts de Prisma

### 📦 Generar Cliente de Prisma

```bash
# Generar cliente (cualquier ambiente)
pnpm run prisma:generate

# Por ambiente específico
pnpm run prisma:generate:dev
pnpm run prisma:generate:qa
pnpm run prisma:generate:prod
```

### 🔄 Migraciones

#### Crear y Aplicar Migración (Desarrollo)

```bash
# Desarrollo - crea migración y la aplica
pnpm run prisma:migrate:dev

# QA - crea migración y la aplica
pnpm run prisma:migrate:qa
```

#### Aplicar Migraciones Existentes (Producción)

```bash
# Desarrollo
pnpm run prisma:deploy:dev

# QA
pnpm run prisma:deploy:qa

# Producción
pnpm run prisma:deploy:prod
```

### 🌱 Seed (Poblar Base de Datos)

```bash
# Ejecutar seed (usa APP_ENV del sistema)
pnpm run prisma:seed

# Por ambiente específico
pnpm run prisma:seed:dev
pnpm run prisma:seed:qa
```

**Nota**: El seed automáticamente se ejecutará con `prisma db seed` gracias a la configuración en package.json.

### 🔥 Reset de Base de Datos

⚠️ **ADVERTENCIA**: Estos comandos DESTRUYEN todos los datos en la base de datos.

```bash
# Reset completo CON seed (desarrollo)
pnpm run prisma:reset:dev
pnpm run db:fresh:dev

# Reset completo CON seed (QA)
pnpm run prisma:reset:qa
pnpm run db:fresh:qa

# Reset SIN seed (desarrollo)
pnpm run prisma:reset:dev:skip-seed
```

### 🔄 Reset + Seed Manual

```bash
# Desarrollo: Reset + Seed en dos pasos
pnpm run db:reset-and-seed:dev

# QA: Reset + Seed en dos pasos
pnpm run db:reset-and-seed:qa
```

### 🎨 Prisma Studio (GUI)

```bash
# Desarrollo
pnpm run prisma:studio:dev

# QA
pnpm run prisma:studio:qa

# Producción
pnpm run prisma:studio:prod
```

### 🏗️ Setup Completo (Nueva Base de Datos)

```bash
# Desarrollo: Generate + Migrate + Seed
pnpm run db:setup:dev

# QA: Generate + Migrate + Seed
pnpm run db:setup:qa

# Producción: Generate + Deploy (sin seed)
pnpm run db:setup:prod
```

---

## 🎯 Flujos de Trabajo Comunes

### 1️⃣ Actualizar Schema y Aplicar Cambios (Desarrollo)

```bash
# 1. Edita prisma/schema.prisma
# 2. Crea y aplica la migración
pnpm run prisma:migrate:dev

# 3. Esto automáticamente:
#    - Crea la migración en prisma/migrations/
#    - Aplica la migración a la DB
#    - Genera el cliente de Prisma
#    - Ejecuta el seed (si está configurado)
```

### 2️⃣ Empezar de Cero (Desarrollo)

```bash
# Reset completo con seed
pnpm run db:fresh:dev

# O en dos pasos
pnpm run prisma:reset:dev:skip-seed
pnpm run prisma:seed:dev
```

### 3️⃣ Solo Poblar Datos (Sin Tocar Schema)

```bash
# Ejecutar seed únicamente
pnpm run prisma:seed:dev
```

### 4️⃣ Deploy a Producción

```bash
# 1. Asegúrate de tener todas las migraciones en git
# 2. En el servidor de producción:
pnpm run db:setup:prod

# Esto ejecuta:
# - prisma generate (genera cliente)
# - prisma migrate deploy (aplica migraciones pendientes)
# - NO ejecuta seed (producción no debe tener datos de prueba)
```

### 5️⃣ Aplicar Migración Existente (Después de Pull)

```bash
# Si alguien más creó una migración:
git pull
pnpm run prisma:migrate:dev
```

---

## 📊 Planes de Suscripción Actuales

Después del seed, la base de datos tendrá estos planes:

| Plan | Precio Base | Precio/Mes | Ahorro | Descuento | Ciclo |
|------|-------------|------------|--------|-----------|-------|
| MONTHLY | $19.99 | $19.99 | $0 | 0% | 1 mes |
| QUARTERLY | $54.99 | $18.33 | $4.98 | 8% | 3 meses |
| SEMESTER | $99.99 | $16.67 | $19.95 | 17% | 6 meses |
| ANNUAL | $179.99 | $15.00 | $59.89 | 25% | 12 meses |

---

## 🔍 Verificar Estado de Migraciones

```bash
# Ver migraciones pendientes
npx prisma migrate status

# Ver estructura de la base de datos
pnpm run prisma:studio:dev
```

---

## 🐛 Troubleshooting

### Error: Migración Fallida

```bash
# 1. Ver el error
npx prisma migrate status

# 2. Si es en desarrollo, hacer reset
pnpm run db:fresh:dev

# 3. Si es en producción, NO hacer reset
#    Corregir la migración manualmente
```

### Error: Cliente Prisma Desactualizado

```bash
# Regenerar el cliente
pnpm run prisma:generate:dev
```

### Error: Base de Datos Inconsistente

```bash
# En desarrollo (⚠️ borra datos)
pnpm run db:fresh:dev

# En producción
# Contactar al equipo de DevOps
```

---

## 📝 Notas Importantes

1. **Nunca** ejecutar `prisma:reset` en producción
2. **Siempre** hacer commit de las migraciones generadas
3. **Revisar** el archivo de migración antes de aplicarlo
4. **Probar** las migraciones en desarrollo/QA antes de producción
5. **Respaldar** la base de datos antes de migraciones grandes

---

## 🔗 Enlaces Útiles

- [Prisma Migrate Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma CLI Reference](https://www.prisma.io/docs/reference/api-reference/command-reference)

---

**Última Actualización**: 11 de Octubre, 2025  
**Versión**: 2.0

