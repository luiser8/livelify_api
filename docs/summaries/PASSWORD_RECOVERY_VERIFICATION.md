# Verificación de Hash de Recuperación de Contraseña - Resumen

## Fecha
Noviembre 27, 2025

## Problema
Cuando un usuario recibe un correo de recuperación de contraseña y abre el enlace, el sistema mostraba directamente el formulario para ingresar la nueva contraseña sin verificar antes si:
- El hash ya había sido procesado (`recovery.active = false`)
- El hash había expirado
- El hash era válido

Esto permitía que el usuario llenara el formulario completo solo para recibir un error al enviar los datos.

## Solución Implementada

### 1. Nuevo Use Case: `VerifyPasswordRecoveryUseCase`

**Ubicación:** `src/application/use-cases/auth/verify-password-recovery.use-case.ts`

Este use case verifica el estado del hash de recuperación antes de mostrar el formulario:

**Funcionalidad:**
- ✅ Busca el registro de recuperación por hash y tipo `RECOVER_PASSWORD`
- ✅ Verifica si existe el registro
- ✅ Verifica si ya fue procesado (`active = false`)
- ✅ Verifica si ha expirado según `APP_PASSWORD_RECOVERY_EXPIRE`
- ✅ Si ha expirado, lo desactiva automáticamente
- ✅ Retorna un objeto con el estado y mensaje descriptivo

**Respuestas posibles:**

```typescript
// Hash válido
{
  valid: true,
  message: 'Recovery link is valid'
}

// Hash ya procesado
{
  valid: false,
  message: 'This recovery link has already been used',
  alreadyProcessed: true
}

// Hash expirado
{
  valid: false,
  message: 'This recovery link has expired',
  expired: true
}
```

### 2. DTO de Verificación

**Ubicación:** `src/presentation/dtos/auth/verify-password-recovery.dto.ts`

**Request DTO:**
```typescript
{
  hash: string // Hash de recuperación del correo
}
```

**Response DTO:**
```typescript
{
  valid: boolean,
  message: string,
  alreadyProcessed?: boolean,
  expired?: boolean
}
```

### 3. Endpoint en AuthController

**Ubicación:** `src/presentation/controllers/auth.controller.ts`

**Endpoint:**
```
POST /auth/verify-password-recovery
```

**Características:**
- 🔓 Endpoint público (no requiere autenticación)
- 🌐 Rate limited: 10 requests por minuto por IP
- 📝 Documentado en Swagger

**Ejemplo de uso:**

```bash
curl -X POST http://localhost:3000/auth/verify-password-recovery \
  -H "Content-Type: application/json" \
  -d '{"hash": "abc123def456"}'
```

**Respuesta exitosa (hash válido):**
```json
{
  "valid": true,
  "message": "Recovery link is valid"
}
```

**Respuesta cuando ya fue procesado:**
```json
{
  "valid": false,
  "message": "This recovery link has already been used",
  "alreadyProcessed": true
}
```

**Respuesta cuando expiró:**
```json
{
  "valid": false,
  "message": "This recovery link has expired",
  "expired": true
}
```

## Flujo de Uso Recomendado

### En el Frontend

1. **Usuario hace clic en el enlace del correo**
   - URL: `https://tuapp.com/reset-password?hash=abc123def456`

2. **Frontend llama al endpoint de verificación**
   ```javascript
   const response = await fetch('/auth/verify-password-recovery', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ hash: 'abc123def456' })
   });
   
   const result = await response.json();
   ```

3. **Según la respuesta:**
   
   **Si `valid: true`:**
   - ✅ Mostrar el formulario de nueva contraseña
   
   **Si `valid: false` y `alreadyProcessed: true`:**
   - ⚠️ Mostrar: "Este enlace de recuperación ya ha sido utilizado"
   - 💡 Sugerir: "Si necesitas cambiar tu contraseña nuevamente, solicita un nuevo enlace"
   
   **Si `valid: false` y `expired: true`:**
   - ⏰ Mostrar: "Este enlace de recuperación ha expirado"
   - 💡 Sugerir: "Por favor, solicita un nuevo enlace de recuperación"
   
   **Si `404` (no encontrado):**
   - ❌ Mostrar: "Enlace de recuperación inválido"

4. **Usuario llena el formulario y envía**
   ```javascript
   await fetch('/auth/reset-password', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       hash: 'abc123def456',
       newPassword: 'NewSecurePassword123!',
       language: 'es'
     })
   });
   ```

## Comparación con Activación de Cuenta

Este flujo es similar al de activación de cuenta:

| Característica | Activación de Cuenta | Recuperación de Contraseña |
|---------------|---------------------|---------------------------|
| Verificación previa | ✅ Sí | ✅ Sí |
| Campo verificado | `recovery.active` | `recovery.active` |
| Verifica expiración | ❌ No | ✅ Sí |
| Tipo de recovery | `REGISTER` | `RECOVER_PASSWORD` |
| Endpoint de verificación | N/A | `/auth/verify-password-recovery` |

## Archivos Modificados

1. ✅ **Nuevo archivo:** `src/application/use-cases/auth/verify-password-recovery.use-case.ts`
2. ✅ **Nuevo archivo:** `src/presentation/dtos/auth/verify-password-recovery.dto.ts`
3. ✅ **Modificado:** `src/presentation/controllers/auth.controller.ts`
4. ✅ **Modificado:** `src/application/application.module.ts`

## Ventajas de esta Implementación

1. **Mejor UX:** El usuario sabe inmediatamente si el enlace es válido
2. **Evita frustración:** No llena el formulario para recibir un error después
3. **Seguridad:** Valida el estado antes de exponer el formulario
4. **Consistencia:** Mismo patrón que activación de cuenta
5. **Mensajes claros:** Respuestas descriptivas para cada caso
6. **Rate limiting:** Protección contra ataques de fuerza bruta

## Testing

### Casos de Prueba

```bash
# 1. Verificar hash válido
POST /auth/verify-password-recovery
Body: { "hash": "valid_hash_here" }
Expected: { "valid": true, "message": "Recovery link is valid" }

# 2. Verificar hash ya procesado
POST /auth/verify-password-recovery
Body: { "hash": "used_hash_here" }
Expected: { "valid": false, "message": "...", "alreadyProcessed": true }

# 3. Verificar hash expirado
POST /auth/verify-password-recovery
Body: { "hash": "expired_hash_here" }
Expected: { "valid": false, "message": "...", "expired": true }

# 4. Verificar hash inexistente
POST /auth/verify-password-recovery
Body: { "hash": "invalid_hash" }
Expected: 404 Not Found
```

## Variables de Entorno

Asegúrate de tener configurada:
```env
APP_PASSWORD_RECOVERY_EXPIRE=1h
# Formato soportado: 30m, 1h, 24h, 1d
```

## Próximos Pasos

1. ✅ Implementar en el frontend la llamada al endpoint antes de mostrar el formulario
2. ✅ Agregar mensajes de error user-friendly
3. ✅ Considerar agregar analytics para trackear enlaces expirados/inválidos
4. ✅ Opcional: Agregar un botón "Solicitar nuevo enlace" cuando expire

## Notas Importantes

- El endpoint es **público** (no requiere autenticación)
- Está protegido por **rate limiting** (10 requests/minuto)
- Si el hash ha expirado, se **desactiva automáticamente** en la base de datos
- El mensaje de error no revela información sensible sobre usuarios
- Compatible con multiidioma (es/en)

## Swagger Documentation

El endpoint está completamente documentado en Swagger:
- Accede a `/api` para ver la documentación interactiva
- Busca la sección "Authentication"
- Encuentra el endpoint "Verify if password recovery hash is valid"

