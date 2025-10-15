# ⚡ Comandos de Base de Datos - Referencia Rápida

## 🚀 Comandos Más Usados

### Aplicar Migración de Subscription Models

```bash
# Ya aplicado! La migración está en: 
# prisma/migrations/20251011210323_/migration.sql
```

### Poblar Base de Datos (Seed)

```bash
# Ejecutar seed
pnpm run prisma:seed:dev

# O simplemente
pnpm prisma db seed
```

### Reset Completo + Seed

```bash
# Borra todo y vuelve a crear desde cero
pnpm run db:fresh:dev

# O manual en 2 pasos
pnpm run prisma:reset:dev:skip-seed
pnpm run prisma:seed:dev
```

### Ver Base de Datos (GUI)

```bash
pnpm run prisma:studio:dev
```

### Crear Nueva Migración

```bash
# 1. Edita prisma/schema.prisma
# 2. Ejecuta:
pnpm run prisma:migrate:dev
```

---

## 📦 Scripts Agregados al package.json

### Nuevos Scripts

- `prisma:reset:dev:skip-seed` - Reset sin seed
- `db:reset-and-seed:dev` - Reset + seed en un comando
- `db:reset-and-seed:qa` - Lo mismo para QA
- `db:fresh:dev` - Alias para reset completo
- `db:fresh:qa` - Alias para reset completo en QA

### Configuración Prisma

```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

Esto permite ejecutar: `npx prisma db seed`

---

## ✅ Lo Que Ya Está Hecho

✅ Migración creada y aplicada  
✅ Enums `PaymentMethod` y `PaymentProvider` creados  
✅ `SubscriptionPlan` actualizado con pricing detallado  
✅ `UserSubscription` actualizado con info de pago  
✅ Seed actualizado con nuevos planes (MONTHLY, QUARTERLY, SEMESTER, ANNUAL)  
✅ Scripts de npm configurados  

---

## 🎯 Próximo Paso

```bash
# Poblar la base de datos con los nuevos planes
pnpm run prisma:seed:dev
```

Esto creará:
- 4 planes de suscripción (Mensual, Trimestral, Semestral, Anual)
- Monedas (MXN, USD, EUR)
- Áreas de LifeWheel
- Preguntas de evaluación

---

Ver documentación completa en: `docs/DATABASE_SCRIPTS.md`

