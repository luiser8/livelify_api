# 📊 Diagnósticos con PostgreSQL y Prisma

## 📋 Resumen

Se ha implementado el almacenamiento de diagnósticos de la rueda de la vida en **PostgreSQL** usando **Prisma ORM**, manteniendo consistencia con el resto del proyecto.

## 🗄️ Modelo de Base de Datos

### Tabla: `Diagnostic`

```prisma
model Diagnostic {
  id         String   @id @default(uuid())
  
  name       String   // Nombre del usuario
  email      String   // Email del usuario
  
  // Puntuaciones de cada área (0-10)
  personal      Int    // Área personal
  professional  Int    // Área profesional
  health        Int    // Salud
  finances      Int    // Finanzas
  family        Int    // Familia
  love          Int    // Amor/Relaciones
  
  average    Float    // Promedio calculado
  
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  @@index([email])
  @@index([createdAt])
}
```

### Índices

- **email**: Para búsquedas rápidas de diagnósticos por usuario
- **createdAt**: Para ordenamiento y filtrado por fecha

## 🏗️ Arquitectura Implementada

```
domain/
└── entities/
    └── diagnostic.entity.ts         # Entidad de dominio con lógica

application/
└── ports/
    └── diagnostic-repository.ts     # Interface del repository
└── use-cases/diagnostic/
    └── send-diagnostic.use-case.ts  # Guarda en BD + envía email

infrastructure/
└── repositories/diagnostic/
    └── diagnostic.repository.ts     # Implementación con Prisma

presentation/
├── dtos/diagnostic/
│   └── send-diagnostic.dto.ts       # Validación de entrada
└── controllers/
    └── diagnostic.controller.ts     # Endpoint público
```

## 🚀 Endpoint

### POST `/api/v1/diagnostic/send`

**Características:**
- ✅ Público (sin autenticación)
- ✅ Guarda en PostgreSQL
- ✅ Genera PDF
- ✅ Envía por email

**Request:**
```json
{
  "scores": {
    "personal": 5,
    "professional": 10,
    "health": 3,
    "finances": 5,
    "family": 7,
    "love": 7
  },
  "name": "Luis Rondon",
  "email": "usuario@email.com",
  "average": 6.2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Diagnostic sent successfully",
  "diagnosticId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## 📊 Operaciones del Repository

### 1. Guardar Diagnóstico

```typescript
const diagnostic = Diagnostic.create(name, email, scores, average);
await diagnosticRepository.save(diagnostic);
```

### 2. Buscar por ID

```typescript
const diagnostic = await diagnosticRepository.findById(id);
```

### 3. Buscar por Email

```typescript
const diagnostics = await diagnosticRepository.findByEmail('user@email.com');
// Retorna todos los diagnósticos del usuario (ordenados por fecha desc)
```

### 4. Obtener Todos

```typescript
const all = await diagnosticRepository.findAll();
// Retorna máximo 1000 diagnósticos (ordenados por fecha desc)
```

## 🔄 Flujo de Ejecución

1. **Request** → Controlador recibe datos
2. **Validación** → DTOs validan entrada
3. **Entidad** → Se crea `Diagnostic` entity
4. **PostgreSQL** → Se guarda con Prisma ✅
5. **PDF** → Se genera el documento
6. **Email** → Se envía con PDF adjunto
7. **Response** → Retorna ID del diagnóstico guardado

## 💾 Datos Almacenados

Cada diagnóstico guarda:
- ✅ ID único (UUID)
- ✅ Nombre y email del usuario
- ✅ Puntuaciones individuales por área (6 áreas)
- ✅ Promedio calculado
- ✅ Timestamp de creación
- ✅ Timestamp de actualización

## 📈 Queries SQL Útiles

### Ver diagnósticos recientes

```sql
SELECT * FROM "Diagnostic" 
ORDER BY "createdAt" DESC 
LIMIT 10;
```

### Buscar por email

```sql
SELECT * FROM "Diagnostic" 
WHERE email = 'usuario@email.com'
ORDER BY "createdAt" DESC;
```

### Estadísticas por área

```sql
SELECT 
  AVG(personal) as avg_personal,
  AVG(professional) as avg_professional,
  AVG(health) as avg_health,
  AVG(finances) as avg_finances,
  AVG(family) as avg_family,
  AVG(love) as avg_love,
  AVG(average) as avg_total
FROM "Diagnostic"
WHERE "createdAt" >= NOW() - INTERVAL '30 days';
```

### Contar diagnósticos por día

```sql
SELECT 
  DATE("createdAt") as date,
  COUNT(*) as count
FROM "Diagnostic"
WHERE "createdAt" >= NOW() - INTERVAL '7 days'
GROUP BY DATE("createdAt")
ORDER BY date DESC;
```

### Usuarios con múltiples diagnósticos

```sql
SELECT 
  email,
  COUNT(*) as diagnostics_count,
  AVG(average) as avg_score
FROM "Diagnostic"
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY diagnostics_count DESC;
```

## 🔧 Migraciones de Prisma

### Migración Creada

```
prisma/migrations/20251018010147_add_diagnostic_model/migration.sql
```

### Ejecutar Migraciones

**Desarrollo:**
```bash
pnpm prisma:migrate:dev
```

**QA:**
```bash
pnpm prisma:migrate:qa
```

**Producción:**
```bash
pnpm prisma:migrate:prod
```

### Ver Estado de Migraciones

```bash
npx prisma migrate status
```

### Revertir Última Migración (si es necesario)

```bash
npx prisma migrate resolve --rolled-back 20251018010147_add_diagnostic_model
```

## 🧪 Testing Local

### 1. Verifica la Base de Datos

```bash
psql -U livelify_user -d livelify -c "\dt Diagnostic"
```

### 2. Prueba el Endpoint

```bash
curl -X POST http://localhost:3000/api/v1/diagnostic/send \
  -H "Content-Type: application/json" \
  -d '{
    "scores": {
      "personal": 5,
      "professional": 10,
      "health": 3,
      "finances": 5,
      "family": 7,
      "love": 7
    },
    "name": "Test User",
    "email": "test@example.com",
    "average": 6.2
  }'
```

### 3. Verifica en la BD

```sql
SELECT * FROM "Diagnostic" WHERE email = 'test@example.com';
```

## 📊 Analytics y Reportes

### Dashboard de Marketing

Puedes crear dashboards para:

1. **Conversión de Leads:**
   - Diagnósticos completados por día/semana/mes
   - Tasa de conversión a registro

2. **Análisis de Áreas:**
   - Áreas con puntuaciones más bajas (oportunidades)
   - Distribución de puntuaciones por área
   - Comparación de promedios por segmento

3. **Segmentación:**
   - Usuarios con promedios bajos (< 5): target prioritario
   - Usuarios con promedios medios (5-7): nurturing
   - Usuarios con promedios altos (> 7): upselling

### Exportar Datos

```typescript
// Ejemplo: Exportar diagnósticos del último mes
const diagnostics = await prisma.diagnostic.findMany({
  where: {
    createdAt: {
      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
  },
  orderBy: { createdAt: 'desc' }
});

// Convertir a CSV
const csv = diagnostics.map(d => 
  `${d.id},${d.name},${d.email},${d.personal},${d.professional},${d.health},${d.finances},${d.family},${d.love},${d.average},${d.createdAt}`
).join('\n');
```

## 🎯 Casos de Uso

### 1. Lead Magnet

- Usuario completa diagnóstico en landing page
- Recibe PDF por email
- Datos guardados para seguimiento

### 2. Email Marketing

```typescript
// Segmentar usuarios con áreas específicas bajas
const targetUsers = await prisma.diagnostic.findMany({
  where: {
    OR: [
      { health: { lte: 3 } },
      { finances: { lte: 3 } }
    ]
  },
  select: { email: true, name: true }
});
// Enviar campaña personalizada
```

### 3. Análisis de Tendencias

```typescript
// Comparar diagnósticos del mismo usuario
const userDiagnostics = await diagnosticRepository.findByEmail('user@email.com');
// Analizar progreso entre el primer y último diagnóstico
```

## 🔒 Consideraciones de Seguridad

1. **Endpoint Público:**
   - ✅ Rate limiting activado (nivel PUBLIC)
   - ✅ Validación de entrada estricta
   - ✅ Sin exposición de datos sensibles

2. **Datos Personales:**
   - Almacena solo nombre y email
   - No guarda datos de pago
   - Cumple con políticas de privacidad

3. **GDPR/Privacidad:**
   - Usuarios pueden solicitar eliminación
   - Datos usados solo para fines de marketing con consentimiento
   - Exportable para portabilidad de datos

## 📈 Mejoras Futuras

- [ ] Endpoints CRUD para gestión de diagnósticos
- [ ] Dashboard admin con gráficos y estadísticas
- [ ] API para consultar histórico de diagnósticos
- [ ] Comparación automática de diagnósticos del mismo usuario
- [ ] Integración con CRM (HubSpot, Salesforce)
- [ ] Webhooks para notificar nuevos diagnósticos
- [ ] Exportación automática a Google Sheets/Excel
- [ ] Machine Learning para predecir áreas de mejora

## 📧 Configuración de Email (Opcional)

El endpoint puede funcionar con o sin envío de email, controlado por la variable de entorno `DIAGNOSTIC_SEND_EMAIL`.

### Variables de Entorno

```env
# Email/SMTP Configuration (solo si DIAGNOSTIC_SEND_EMAIL=true)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=xxxx-xxxx-xxxx-xxxx
SMTP_FROM=Livelify <noreply@livelify.com>

# Control de envío de email
DIAGNOSTIC_SEND_EMAIL=true   # true: envía email, false: solo guarda en BD
```

### Comportamiento

| DIAGNOSTIC_SEND_EMAIL | Guarda en BD | Genera PDF | Envía Email |
|----------------------|--------------|------------|-------------|
| `true` (default)     | ✅           | ✅         | ✅          |
| `false`              | ✅           | ❌         | ❌          |

### Respuestas del Endpoint

**Con email habilitado (DIAGNOSTIC_SEND_EMAIL=true):**
```json
{
  "success": true,
  "message": "Diagnostic saved and email sent successfully",
  "diagnosticId": "550e8400-e29b-41d4-a716-446655440000",
  "emailSent": true
}
```

**Con email deshabilitado (DIAGNOSTIC_SEND_EMAIL=false):**
```json
{
  "success": true,
  "message": "Diagnostic saved successfully (email disabled)",
  "diagnosticId": "550e8400-e29b-41d4-a716-446655440000",
  "emailSent": false
}
```

### Casos de Uso

**1. Testing sin SMTP:**
```env
# .env.development
DIAGNOSTIC_SEND_EMAIL=false
```
Permite probar el endpoint sin configurar servidor de email.

**2. Solo producción:**
```env
# .env.development
DIAGNOSTIC_SEND_EMAIL=false

# .env.production  
DIAGNOSTIC_SEND_EMAIL=true
```
Emails solo en producción, evita spam en desarrollo.

**3. Costos:**
Si tu proveedor SMTP cobra por email, puedes deshabilitarlo temporalmente en ciertos ambientes.

## 🚀 Deployment

### Variables de Entorno Requeridas

```env
# Base de datos (REQUERIDO)
DATABASE_URL="postgresql://user:password@host:5432/database"

# Control de email (OPCIONAL)
DIAGNOSTIC_SEND_EMAIL=true   # Default: true

# Email (solo si DIAGNOSTIC_SEND_EMAIL=true)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
SMTP_FROM=Livelify <noreply@livelify.com>
```

### Migración en Producción

```bash
# 1. Hacer backup de la BD
pg_dump -U user database > backup.sql

# 2. Ejecutar migración
pnpm prisma:migrate:prod

# 3. Verificar
psql -U user -d database -c "\d Diagnostic"
```

## 📞 Soporte

Para más información:
- Ver documentación de Prisma: https://www.prisma.io/docs
- Arquitectura hexagonal: `docs/summaries/HEXAGONAL_ARCHITECTURE.md`
- Endpoints: `docs/summaries/ENDPOINTS_FINAL.md`

---

**Creado:** Octubre 2025  
**Autor:** Luis Rondón  
**Proyecto:** Livelify API

