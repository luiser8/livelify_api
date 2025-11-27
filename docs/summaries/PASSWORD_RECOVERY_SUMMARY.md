# Password Recovery Implementation Summary

## Overview

Esta implementación añade funcionalidad completa de recuperación de contraseña al sistema, permitiendo a los usuarios restablecer su contraseña mediante un enlace enviado por email.

## Features Implementadas

### 1. Templates de Email

**Archivo**: `src/infrastructure/adapters/email/email-templates.ts`

Se agregó:
- Interface `PasswordRecoveryEmailTemplate` con textos multilingües
- Objeto `passwordRecoveryEmailTemplates` con traducciones en español e inglés
- Función `generatePasswordRecoveryEmailHtml()` para generar el HTML del email

**Características del template**:
- Soporte multilingüe (español/inglés)
- Diseño responsive con HTML inline
- Botón de acción destacado (color naranja: #FF5722)
- Advertencia de seguridad destacada
- Mensaje de expiración (1 hora)
- Versión texto plano para clientes sin HTML

### 2. Adapter de SendGrid

**Archivo**: `src/infrastructure/adapters/email/sendgrid-email.adapter.ts`

Se agregó:
- Propiedad `passwordRecoveryTemplateId` para template personalizado de SendGrid
- Método `sendPasswordRecoveryEmail()` que:
  - Genera URL de recuperación con hash
  - Usa template de SendGrid si está configurado
  - Fallback a template HTML generado
  - Logs de éxito/error

### 3. Use Cases

#### RequestPasswordRecoveryUseCase

**Archivo**: `src/application/use-cases/auth/request-password-recovery.use-case.ts`

Funcionalidad:
- Busca usuario por email
- Genera hash de recuperación único (64 caracteres hex)
- Crea registro en `UserRecovery` con tipo `RECOVER_PASSWORD`
- Envía email de recuperación
- **Seguridad**: Siempre retorna éxito, no revela si el email existe

#### ResetPasswordUseCase

**Archivo**: `src/application/use-cases/auth/reset-password.use-case.ts`

Funcionalidad:
- Valida hash de recuperación
- Verifica que esté activo y no expirado (1 hora)
- Valida formato de nueva contraseña
- Hashea contraseña con bcrypt
- Actualiza contraseña del usuario
- Desactiva el registro de recuperación
- (Opcional) Puede invalidar todas las sesiones

### 4. DTOs

#### RequestPasswordRecoveryDto

**Archivo**: `src/presentation/dtos/auth/request-password-recovery.dto.ts`

```typescript
{
  email: string,         // Requerido, formato email válido
  language?: 'es' | 'en' // Opcional, default 'es'
}
```

#### ResetPasswordDto

**Archivo**: `src/presentation/dtos/auth/reset-password.dto.ts`

```typescript
{
  hash: string,         // Requerido
  newPassword: string   // Requerido, min 8 chars, mayúscula+minúscula+número
}
```

### 5. Endpoints

**Controller**: `src/presentation/controllers/auth.controller.ts`

#### POST /auth/request-password-recovery

- **Público**: ✅ (no requiere autenticación)
- **Rate Limited**: 5 intentos por 15 minutos por IP
- **Body**: `RequestPasswordRecoveryDto`
- **Response**: `{ message: string }`
- **Status Codes**:
  - 200: Email enviado (o mensaje genérico)
  - 429: Rate limit excedido

#### POST /auth/reset-password

- **Público**: ✅ (no requiere autenticación)
- **Rate Limited**: 5 intentos por 15 minutos por IP
- **Body**: `ResetPasswordDto`
- **Response**: `{ message: string }`
- **Status Codes**:
  - 200: Contraseña restablecida
  - 400: Hash inválido o expirado
  - 429: Rate limit excedido

### 6. Repositorio Updates

#### UserRepositoryInterface

**Archivo**: `src/domain/repositories/user/user.repository.interface.ts`

Nuevo método:
```typescript
updatePassword(id: UserId, hashedPassword: string): Promise<void>
```

#### UserRecoveryRepositoryInterface

**Archivo**: `src/domain/repositories/user/user-recovery.repository.interface.ts`

Nuevos métodos:
```typescript
create(data: any): Promise<UserRecovery>
findByHashAndType(hash: string, type: RecoveryType): Promise<UserRecovery | null>
deactivate(id: string): Promise<void>
```

## Flujo de Usuario

### 1. Solicitar Recuperación

```bash
POST /auth/request-password-recovery
{
  "email": "user@example.com",
  "language": "es"
}
```

→ Usuario recibe email con enlace:
`https://frontend.com/reset-password?hash=abc123...`

### 2. Restablecer Contraseña

```bash
POST /auth/reset-password
{
  "hash": "abc123...",
  "newPassword": "NewPassword123"
}
```

→ Contraseña actualizada, sesiones activas continúan válidas

### 3. Login con Nueva Contraseña

```bash
POST /auth/login
{
  "email": "user@example.com",
  "password": "NewPassword123"
}
```

## Configuración

### Variables de Entorno

Agregar a `.env.development`, `.env.qa`, `.env.production`:

```env
# SendGrid - Password Recovery (opcional)
SENDGRID_PASSWORD_RECOVERY_TEMPLATE_ID=d-xxxxx

# Frontend URL para links
SENDGRID_FRONTEND_URL=https://your-frontend.com

# Tiempo de expiración para enlaces de recuperación de contraseña
# Formatos soportados: 1h (horas), 30m (minutos), 1d (días)
# Default: 1h
APP_PASSWORD_RECOVERY_EXPIRE=1h

# Tiempo de expiración para enlaces de activación de cuenta
# Formatos soportados: 1h (horas), 30m (minutos), 1d (días)
# Default: 24h
APP_ACTIVATION_ACCOUNT_EXPIRE=24h
```

### Configuración de SendGrid (Opcional)

Si se configura `SENDGRID_PASSWORD_RECOVERY_TEMPLATE_ID`, el sistema usará ese template.
Si no, usará el template HTML generado por `generatePasswordRecoveryEmailHtml()`.

Variables disponibles en template de SendGrid:
- `firstName`: Nombre del usuario
- `recoveryUrl`: URL completa de recuperación
- `language`: Idioma del email

## Seguridad

### Medidas Implementadas

1. **Hash Único**: 64 caracteres hexadecimales generados con crypto.randomBytes
2. **Expiración Configurable**: 
   - Recovery de contraseña: Default 1 hora (configurable con `APP_PASSWORD_RECOVERY_EXPIRE`)
   - Activación de cuenta: Default 24 horas (configurable con `APP_ACTIVATION_ACCOUNT_EXPIRE`)
   - Formatos soportados: `1h`, `30m`, `2d`, etc.
3. **Un solo uso**: Después de usarse, el registro se desactiva
4. **Rate Limiting**: 5 intentos por 15 minutos por IP
5. **No revelar información**: Respuesta genérica sin importar si email existe
6. **Validación de contraseña**: Min 8 chars, mayúscula, minúscula, número
7. **Hash seguro**: bcrypt con 10 rounds
8. **Desactivación automática**: Enlaces expirados se desactivan automáticamente

### Consideraciones

- Los enlaces solo pueden usarse una vez
- Los enlaces expiran según configuración (default: 1h para recovery, 24h para activación)
- Enlaces expirados se desactivan automáticamente al intentar usarlos
- Las sesiones activas NO se invalidan automáticamente
  - Si quieres invalidarlas, descomenta la línea en `reset-password.use-case.ts`

## Testing

### Script de Prueba

**Archivo**: `scripts/tests/test_password_recovery.sh`

```bash
# Dar permisos
chmod +x scripts/tests/test_password_recovery.sh

# Ejecutar
./scripts/tests/test_password_recovery.sh
```

### Pruebas Manuales

1. **Solicitar recuperación**:
```bash
curl -X POST http://localhost:3000/auth/request-password-recovery \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "language": "es"}'
```

2. **Verificar email**: Revisar inbox y copiar hash del enlace

3. **Restablecer contraseña**:
```bash
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"hash": "HASH_FROM_EMAIL", "newPassword": "NewPassword123"}'
```

4. **Login con nueva contraseña**:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "NewPassword123"}'
```

## Swagger Documentation

Los endpoints están documentados en Swagger con:
- Descripciones completas
- Ejemplos de request/response
- Códigos de estado HTTP
- Información de rate limiting

Accede a: `http://localhost:3000/api/docs`

## Database Schema

La tabla `UserRecovery` ya existía y se reutiliza con el tipo `RECOVER_PASSWORD`:

```prisma
model UserRecovery {
  id        String       @id @default(uuid())
  userId    String
  type      RecoveryType
  urlHash   String?      @unique
  active    Boolean      @default(true)
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum RecoveryType {
  REGISTER
  RECOVER_PASSWORD  // <-- Usado para recovery
  RECOVER_EMAIL
}
```

## Next Steps

### Mejoras Opcionales

1. **Historial de cambios de contraseña**
   - Guardar fecha del último cambio
   - Notificar cambios de contraseña por email

2. **Límite de intentos por usuario**
   - Prevenir spam de emails a un usuario específico

3. **Invalidar sesiones**
   - Opción para cerrar todas las sesiones al cambiar contraseña

4. **Notificación de seguridad**
   - Email confirmando cambio exitoso de contraseña

5. **2FA**
   - Agregar verificación de dos factores al proceso

## Troubleshooting

### Email no llega

1. Verificar configuración de SendGrid:
```bash
echo $SENDGRID_API_KEY
echo $SENDGRID_FROM_EMAIL
```

2. Revisar logs del servidor:
```bash
tail -f logs/app.log | grep "Password recovery"
```

3. Verificar dominio sender verificado en SendGrid

### Hash inválido o expirado

- Los hashes expiran en 1 hora
- Los hashes solo pueden usarse una vez
- Solicitar nueva recuperación si es necesario

### Rate limit

- Esperar 15 minutos
- Verificar configuración de THROTTLE_TTL y THROTTLE_LIMIT

## Conclusión

La funcionalidad de recuperación de contraseña está completamente implementada con:
- ✅ Templates de email multilingües
- ✅ Seguridad robusta
- ✅ Rate limiting
- ✅ Validación de contraseñas
- ✅ Documentación Swagger
- ✅ Scripts de testing
- ✅ Soporte para templates personalizados de SendGrid

El sistema está listo para producción siguiendo las mejores prácticas de seguridad.

