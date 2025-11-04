# Refactoring: GoalBudget to ActionBudget (Integrated into GtdAction) - COMPLETADO

## Resumen de Cambios

Se ha completado la refactorización de `GoalBudget` a `ActionBudget`, moviendo la funcionalidad de presupuesto desde `ProjectGoal` hacia `GtdAction`. **El presupuesto ahora se crea directamente al crear una acción, y el Budget del proyecto se actualiza automáticamente.**

## ✅ Cambios Completados

### 1. Schema de Prisma
- **Archivo**: `prisma/schema.prisma`
- ✅ Modelo `ActionBudget` vinculado a `GtdAction` (1:1)
- ❌ Modelo `GoalBudget` eliminado (se renombrará en la migración)

### 2. Domain Layer

#### Value Objects
- ✅ **Nuevo**: `src/domain/value-objects/action-budget/action-budget-id.value-object.ts`
- ❌ **Eliminado**: `src/domain/value-objects/goal-budget/` (toda la carpeta)

#### Entities
- ✅ **Nuevo**: `src/domain/entities/action-budget/action-budget.entity.ts`
  - Cambia `goalId` por `actionId`
  - Mantiene toda la lógica de cálculo de presupuestos (IMO/IDO)
- ❌ **Eliminado**: `src/domain/entities/goal-budget/` (toda la carpeta)

#### Repository Interfaces
- ✅ **Nuevo**: `src/domain/repositories/action-budget/action-budget.repository.interface.ts`
- ❌ **Eliminado**: `src/domain/repositories/goal-budget/` (toda la carpeta)

### 3. Infrastructure Layer

#### Repositories
- ✅ **Nuevo**: `src/infrastructure/repositories/action-budget/action-budget.repository.ts`
- ❌ **Eliminado**: `src/infrastructure/repositories/goal-budget/` (toda la carpeta)

### 4. Application Layer

#### Ports
- ✅ **Mantiene**: `src/application/ports/action-budgets.ts`
- ❌ **Eliminado**: `src/application/ports/goal-budgets.ts`

#### Use Cases
- ✅ **Modificado**: `src/application/use-cases/action/create-gtd-action.use-case.ts`
  - **Crea el ActionBudget** si se proporcionan `baseCapital` y `currencyCode`
  - **Actualiza el Budget del proyecto** sumando todos los ActionBudgets
- ✅ **Modificado**: `src/application/use-cases/action/complete-action.use-case.ts`
  - **Recalcula el Budget del proyecto** al completar una acción
- ❌ **Eliminado**: `src/application/use-cases/goal-budget/` (toda la carpeta con 3 use cases)

### 5. Presentation Layer

#### DTOs
- ✅ **Modificado**: `src/presentation/dtos/action/create-gtd-action.dto.ts`
  - Agregados campos opcionales: `baseCapital` y `currencyCode`
  - Agregado `ActionBudgetResponseDto` en la respuesta
- ❌ **Eliminado**: `src/presentation/dtos/goal-budget/` (toda la carpeta)

#### Controllers
- ✅ **Modificado**: `src/presentation/controllers/action.controller.ts`
  - El endpoint `POST /actions` acepta campos de presupuesto opcionales
- ❌ **NO hay controller separado** para ActionBudget

### 6. Module Configuration

#### Repository Module
- ✅ `src/infrastructure/config/repository.module.ts`
  - Agregado `ActionBudgetRepository`
  - **Eliminadas referencias a GoalBudgetRepository**

### 7. Database Migration
- ✅ **Archivo**: `prisma/migrations/20251031000000_rename_goalbudget_to_actionbudget/migration.sql`
- **Pendiente de aplicar**: La migración está lista pero NO ejecutada

## Funcionalidad Completa

### Flujo de Creación de Acción con Presupuesto

1. **Usuario crea una acción** (con presupuesto opcional):
```http
POST /actions
{
  "goalId": "uuid",
  "title": "Mi acción",
  "energy": "MEDIUM",
  "baseCapital": 3000,      // ⬅️ OPCIONAL
  "currencyCode": "USD"     // ⬅️ OPCIONAL
}
```

2. **Sistema ejecuta**:
   - ✅ Crea la `GtdAction`
   - ✅ Si se proporcionó presupuesto → Crea el `ActionBudget`
   - ✅ **Suma todos los ActionBudgets del proyecto**
   - ✅ **Actualiza el Budget del proyecto** (IMO/IDO totales)
   - ✅ Actualiza el progreso del proyecto

### Flujo de Completar Acción

1. **Usuario completa una acción**:
```http
PUT /actions/{actionId}/complete
```

2. **Sistema ejecuta**:
   - ✅ Marca la acción como completada
   - ✅ Actualiza el progreso del proyecto
   - ✅ **Recalcula el Budget del proyecto** sumando todos los ActionBudgets

### Cálculo del Budget del Proyecto

El `Budget` del proyecto (modelo existente) ahora se calcula sumando **todos los ActionBudgets**:

```typescript
// Budget del proyecto = suma de todos los ActionBudgets
totalMonthlyBudget (IMO) = Σ(actionBudget.monthlyBudget)
totalDailyBudget (IDO) = Σ(actionBudget.dailyBudget)
```

## Arquitectura Final

```
GtdProject
  ├── Budget (IMO/IDO totales del proyecto) 💰
  └── GtdProjectDetail
      └── ProjectGoal (sin presupuesto)
          └── GtdAction
              └── ActionBudget 💰 (opcional)
                  ├── baseCapital: 3000
                  ├── multiplier: 1.3
                  ├── totalCapital: 3900
                  ├── monthlyBudget: 650
                  └── dailyBudget: 21.66

⬇️ Cuando se crea/completa una acción ⬇️
Budget.monthlyBudget = Σ ActionBudget.monthlyBudget
Budget.dailyBudget = Σ ActionBudget.dailyBudget
```

## Endpoint Actualizado

### Crear Acción con Presupuesto (Integrado)
```http
POST /actions
Authorization: Bearer {token}

{
  "goalId": "uuid",
  "title": "Mi acción",
  "description": "Descripción de la acción",
  "energy": "MEDIUM",
  "timeEstimate": 60,
  "dueDate": "2024-12-31T23:59:59.000Z",
  "contextId": "uuid",
  "baseCapital": 3000,      // ⬅️ OPCIONAL: Crea presupuesto automáticamente
  "currencyCode": "USD"     // ⬅️ OPCIONAL: Requerido si se proporciona baseCapital
}
```

**Respuesta**:
```json
{
  "action": {
    "id": "uuid",
    "goalId": "uuid",
    "title": "Mi acción",
    ...
  },
  "budget": {                 // ⬅️ Solo si se proporcionaron baseCapital y currencyCode
    "id": "uuid",
    "baseCapital": 3000,
    "multiplier": 1.3,
    "totalCapital": 3900,
    "monthlyBudget": 650,      // IMO de esta acción
    "dailyBudget": 21.66,      // IDO de esta acción
    "projectMonths": 6,
    "projectDays": 180,
    "currencyCode": "USD",
    "currencySymbol": "$"
  }
}
```

**Efecto secundario**: El `Budget` del proyecto se actualiza con la suma de todos los ActionBudgets.

## Archivos Eliminados ❌

- `src/application/use-cases/goal-budget/` (3 archivos)
- `src/presentation/dtos/goal-budget/` (3 archivos)
- `src/domain/entities/goal-budget/` (1 archivo)
- `src/domain/value-objects/goal-budget/` (1 archivo)
- `src/domain/repositories/goal-budget/` (1 archivo)
- `src/infrastructure/repositories/goal-budget/` (1 archivo)
- `src/application/ports/goal-budgets.ts`

**Total**: ~11 archivos eliminados

## Próximos Pasos

1. **Aplicar la migración**:
   ```bash
   npx prisma migrate deploy
   ```
   ⚠️ **IMPORTANTE**: Esta migración renombrará `GoalBudget` → `ActionBudget` y `goalId` → `actionId`. Haz un backup antes!

2. **Migrar datos existentes** (si aplica):
   - Los datos en `GoalBudget` serán renombrados a `ActionBudget`
   - Las referencias `goalId` serán renombradas a `actionId`
   - **Asegúrate de que las referencias apunten a acciones, no a goals**

3. **Probar en desarrollo**:
   - Crear acciones sin presupuesto
   - Crear acciones con presupuesto
   - Verificar que el Budget del proyecto se actualice correctamente
   - Completar acciones y verificar recalculation del Budget

## Notas Importantes

- ✅ **Arquitectura hexagonal** mantenida
- ✅ **Compilación exitosa**: Todo compila sin errores
- ✅ **Budget del proyecto se actualiza automáticamente** al crear/completar acciones con presupuesto
- ⚠️ **Breaking Change**: No es compatible con el sistema anterior
- ⚠️ **Migración pendiente**: La base de datos aún no ha sido migrada
- 💡 **Presupuesto en acciones**: Ahora tiene sentido porque las acciones son las que tienen costos reales

## Verificación Final

- ✅ TypeScript compila sin errores
- ✅ Linting sin errores en archivos modificados
- ✅ Toda la lógica de GoalBudget fue movida a las acciones
- ✅ Budget del proyecto se calcula automáticamente
- ✅ Archivos legacy eliminados
- ⏳ Migración de base de datos pendiente

## Cambios Realizados

### 1. Schema de Prisma
- **Archivo**: `prisma/schema.prisma`
- Se mantiene el modelo `ActionBudget` que ya existía
- La relación ahora es: `GtdAction` → `ActionBudget` (1:1)

### 2. Domain Layer

#### Value Objects
- **Nuevo**: `src/domain/value-objects/action-budget/action-budget-id.value-object.ts`
  - Reemplaza a `GoalBudgetId` con `ActionBudgetId`

#### Entities
- **Nuevo**: `src/domain/entities/action-budget/action-budget.entity.ts`
  - Reemplaza a `GoalBudget` con `ActionBudget`
  - Cambia `goalId` por `actionId`
  - Mantiene toda la lógica de cálculo de presupuestos (IMO/IDO)

#### Repository Interfaces
- **Nuevo**: `src/domain/repositories/action-budget/action-budget.repository.interface.ts`
  - `findByActionId()` en lugar de `findByGoalId()`

### 3. Infrastructure Layer

#### Repositories
- **Nuevo**: `src/infrastructure/repositories/action-budget/action-budget.repository.ts`
  - Implementa `ActionBudgetRepositoryInterface`
  - Usa el modelo Prisma `ActionBudget`

### 4. Application Layer

#### Ports
- **Nuevo**: `src/application/ports/action-budgets.ts`
  - Token: `ACTION_BUDGET_REPOSITORY_TOKEN`

#### Use Cases
- **Modificado**: `src/application/use-cases/action/create-gtd-action.use-case.ts`
  - **Ahora crea el ActionBudget si se proporcionan `baseCapital` y `currencyCode`**
  - Integra la lógica de presupuesto directamente en la creación de la acción

### 5. Presentation Layer

#### DTOs
- **Modificado**: `src/presentation/dtos/action/create-gtd-action.dto.ts`
  - Agregados campos opcionales: `baseCapital` y `currencyCode`
  - Agregado `ActionBudgetResponseDto` en la respuesta
  - El presupuesto se devuelve como parte de `CreateGtdActionResponseDto`

#### Controllers
- **Modificado**: `src/presentation/controllers/action.controller.ts`
  - El endpoint `POST /actions` ahora acepta campos de presupuesto opcionales
  - **NO hay controller separado para ActionBudget**

### 6. Module Configuration

#### Repository Module
- `src/infrastructure/config/repository.module.ts`
  - Agregado `ActionBudgetRepository` con el token `ACTION_BUDGET_REPOSITORY_TOKEN`

#### Application Module
- `src/application/application.module.ts`
  - Sin cambios adicionales (usa el CreateGtdActionUseCase existente)

#### Presentation Module
- `src/presentation/presentation.module.ts`
  - Sin cambios adicionales (usa el ActionController existente)

### 7. Database Migration
- **Archivo**: `prisma/migrations/20251031000000_rename_goalbudget_to_actionbudget/migration.sql`
- **Cambios**:
  - Renombra tabla `GoalBudget` → `ActionBudget`
  - Renombra columna `goalId` → `actionId`
  - Actualiza índices únicos
  - Actualiza foreign keys para apuntar a `GtdAction` en lugar de `ProjectGoal`

## Arquitectura Hexagonal

La refactorización mantiene la arquitectura hexagonal:
- **Domain**: Entidades y reglas de negocio (ActionBudget entity)
- **Application**: Casos de uso (Create GtdAction con presupuesto integrado)
- **Infrastructure**: Implementación de repositorios (Prisma)
- **Presentation**: Controllers y DTOs (API REST)

## Funcionalidad

### Cálculo de Presupuestos
El presupuesto se calcula automáticamente al crear una acción:
- `baseCapital`: Capital base (ej: 3000)
- `multiplier`: Factor multiplicador (fijo: 1.3)
- `totalCapital`: baseCapital * multiplier (ej: 3900)
- `monthlyBudget` (IMO): totalCapital / meses del proyecto
- `dailyBudget` (IDO): totalCapital / días del proyecto

### Relaciones
```
GtdProject
  └── GtdProjectDetail
      └── ProjectGoal
          └── GtdAction
              └── ActionBudget (1:1) 💰 [Creado opcionalmente al crear la acción]
```

## Endpoint Actualizado

### Crear Acción con Presupuesto (Integrado)
```http
POST /actions
Authorization: Bearer {token}

{
  "goalId": "uuid",
  "title": "Mi acción",
  "description": "Descripción de la acción",
  "energy": "MEDIUM",
  "timeEstimate": 60,
  "dueDate": "2024-12-31T23:59:59.000Z",
  "contextId": "uuid",
  "baseCapital": 3000,      // ⬅️ OPCIONAL: Crea presupuesto automáticamente
  "currencyCode": "USD"     // ⬅️ OPCIONAL: Requerido si se proporciona baseCapital
}
```

**Respuesta**:
```json
{
  "action": {
    "id": "uuid",
    "goalId": "uuid",
    "title": "Mi acción",
    ...
  },
  "budget": {                 // ⬅️ Solo si se proporcionaron baseCapital y currencyCode
    "id": "uuid",
    "baseCapital": 3000,
    "multiplier": 1.3,
    "totalCapital": 3900,
    "monthlyBudget": 650,
    "dailyBudget": 21.66,
    "projectMonths": 6,
    "projectDays": 180,
    "currencyCode": "USD",
    "currencySymbol": "$"
  }
}
```

## Cambios Importantes vs Versión Anterior

### ✅ Lo que CAMBIÓ:
1. **NO hay controller separado** para ActionBudget
2. **El presupuesto se crea al crear la acción**, no en un endpoint separado
3. **Los campos `baseCapital` y `currencyCode` son opcionales** en `CreateGtdActionDto`
4. **La respuesta incluye el presupuesto** si se creó

### ❌ Lo que NO se hizo:
1. ~~Controller separado ActionBudgetController~~ (Eliminado)
2. ~~Endpoints separados para crear/actualizar presupuestos~~ (No necesarios)
3. ~~Use cases separados para ActionBudget~~ (Integrados en CreateGtdActionUseCase)

## Próximos Pasos

1. **Aplicar la migración**:
   ```bash
   npx prisma migrate deploy
   ```
   ⚠️ **IMPORTANTE**: Esta migración modificará datos existentes. Se recomienda hacer un backup de la base de datos antes de aplicarla.

2. **Migrar datos existentes** (si aplica):
   - Si tienes datos en `GoalBudget` que referencian `ProjectGoal`, necesitarás migrarlos manualmente a `ActionBudget` referenciando las `GtdAction` correspondientes.

3. **Eliminar código legacy** (después de verificar que todo funciona):
   - `src/domain/entities/goal-budget/`
   - `src/domain/value-objects/goal-budget/`
   - `src/domain/repositories/goal-budget/`
   - `src/infrastructure/repositories/goal-budget/`
   - `src/application/use-cases/goal-budget/`
   - `src/presentation/dtos/goal-budget/`
   - `src/application/ports/goal-budgets.ts`

## Notas Importantes

- ⚠️ **Breaking Change**: Esta es una refactorización significativa que rompe la compatibilidad con el sistema anterior.
- Los old use cases y controllers de `GoalBudget` aún existen pero no se están usando.
- La migración SQL ha sido creada pero NO aplicada todavía.
- Se recomienda probar exhaustivamente en un ambiente de desarrollo antes de aplicar en producción.
- **El presupuesto ahora es opcional y se crea junto con la acción**, no como un recurso separado.

## Verificación

Para verificar que todo funciona correctamente:
1. Aplicar la migración en un ambiente de desarrollo
2. Probar la creación de una GtdAction **sin presupuesto** (sin enviar baseCapital/currencyCode)
3. Probar la creación de una GtdAction **con presupuesto** (enviando baseCapital y currencyCode)
4. Verificar que los cálculos de IMO/IDO sean correctos
5. Verificar que la respuesta incluya el presupuesto cuando se crea

