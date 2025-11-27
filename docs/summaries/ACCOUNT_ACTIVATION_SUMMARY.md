# Sistema de Activación de Cuenta por Email

## Resumen

Se ha implementado un sistema completo de activación de cuenta mediante email. Cuando un usuario se registra, recibe un email con un enlace de activación que contiene un hash único. Al hacer clic en el enlace y enviar el hash, la cuenta queda activada.

## Componentes Creados

### 1. Entidad de Dominio
- **UserRecovery** (`src/domain/entities/user/user-recovery.entity.ts`)
  - Gestiona los registros de recuperación y activación
  - Tipos: REGISTER, RECOVER_PASSWORD, RECOVER_EMAIL
  - Contiene métodos para activar/desactivar registros

### 2. Repositorio
- **UserRecoveryRepository** (`src/infrastructure/repositories/user/user-recovery.repository.ts`)
  - Implementa la interfaz del repositorio
  - Métodos: save, findByUrlHash, findByUserId, update, deleteByUserId

### 3. Adaptador de Email
- **SendGridEmailAdapter** - Método nuevo: `sendActivationEmail()`
  - ✅ **Refactorizado**: Código limpio, templates separados
  - ✅ **Soporte multiidioma**: Español ('es') e Inglés ('en')
  - ✅ Templates separados en archivo dedicado (`email-templates.ts`)
  - Envía emails de activación con template de SendGrid o HTML inline
  - Genera URL de activación con hash único
  - No interfiere con el método `sendEmail()` existente
  - Parámetros: `to`, `activationHash`, `firstName`, `language`

### 4. Caso de Uso de Registro
- **CreateUserWithProfileUseCase** (modificado)
  - Genera hash aleatorio de 64 caracteres
  - Guarda el hash en UserRecovery con tipo REGISTER
  - Envía email de activación al usuario

### 5. Caso de Uso de Activación
- **ActivateAccountUseCase** (`src/application/use-cases/user/activate-account.use-case.ts`)
  - Valida el hash recibido
  - Verifica que sea de tipo REGISTER
  - ✅ **Verifica expiración del link**: Usa `APP_ACTIVATION_ACCOUNT_EXPIRE` (default: 24h)
  - ✅ **Valida con `createdAt`**: Compara tiempo transcurrido desde creación
  - ✅ **Desactiva links expirados**: Si está expirado, marca como inactivo
  - Desactiva el registro de recuperación (marca como usado)

### 6. Caso de Uso de Login (modificado)
- **LoginUseCase** (`src/application/use-cases/auth/login.use-case.ts`)
  - ✅ Valida credenciales del usuario
  - ✅ **Verifica que la cuenta esté activada**
  - ✅ Busca registros de UserRecovery con type REGISTER
  - ✅ Si encuentra uno con active: true, bloquea el login
  - ✅ Si no existe o está inactivo (active: false), permite el login

### 7. Endpoint REST
- **POST /users/activate**
  - Endpoint público (no requiere autenticación)
  - Rate limited: 5 intentos por 15 minutos
  - Body: `{ "hash": "string" }`
  - Response: `{ "success": boolean, "message": string }`

- **POST /auth/login** (modificado)
  - Endpoint público
  - Valida que la cuenta esté activada antes de permitir login
  - **HTTP 403 Forbidden** si cuenta no activada con mensaje: "Account not activated. Please check your email and activate your account."
  - **HTTP 401 Unauthorized** si credenciales inválidas

### 8. DTOs
- **ActivateAccountDto** - Para validación del request
- **ActivateAccountResponseDto** - Para la respuesta

## Variables de Entorno Requeridas

Añade estas variables a tu archivo `.env`:

```env
# SendGrid Configuration
SENDGRID_API_KEY=tu_api_key_de_sendgrid
SENDGRID_FROM_EMAIL=noreply@tudominio.com
SENDGRID_TEMPLATE_ID=d-xxxxx  # Template existente para otros emails
SENDGRID_ACTIVATION_TEMPLATE_ID=d-yyyyy  # (Opcional) Template específico para activación

# Frontend URL
FRONTEND_URL=http://localhost:5173/app  # URL de tu frontend para los enlaces de activación

# Activation Link Expiration
APP_ACTIVATION_ACCOUNT_EXPIRE=24h  # Tiempo de expiración del link de activación (24h, 1h, 30m, 1d)
```

## Uso con Idiomas

El sistema ahora soporta emails de activación en **Español** e **Inglés**. El idioma se especifica en el registro:

### Registro con idioma

```bash
POST /users/register
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "address": "123 Main St",
  "phone": "+1234567890",
  "acceptTermsAndPolicies": true,
  "language": "en"  // Opcional: 'es' (default) o 'en'
}
```

### Templates de Email

Los templates están separados en `email-templates.ts`:

**Español ('es'):**
- Asunto: "Activa tu cuenta - Livelify"
- Saludo: "¡Bienvenido a Livelify, {firstName}!"
- Botón: "Activar mi cuenta"

**Inglés ('en'):**
- Subject: "Activate your account - Livelify"
- Greeting: "Welcome to Livelify, {firstName}!"
- Button: "Activate my account"

## Flujo de Activación

1. **Registro del Usuario**
   - Usuario envía POST a `/users/register`
   - Sistema crea usuario, perfil y LifeWheel
   - Sistema genera hash aleatorio de 64 caracteres
   - Sistema guarda registro en UserRecovery (type: REGISTER, urlHash: hash, active: true)
   - Sistema envía email con enlace: `${FRONTEND_URL}/activate-account?hash=${hash}`
   - ⚠️ **El usuario NO puede iniciar sesión hasta activar su cuenta**

2. **Usuario Recibe Email**
   - Email contiene botón/link con el hash en la URL
   - El hash es único y está asociado al usuario

3. **Activación**
   - Frontend redirige al usuario y obtiene el hash de la URL
   - Frontend envía POST a `/users/activate` con `{ "hash": "..." }`
   - Backend busca el registro en UserRecovery por hash
   - Backend valida que sea tipo REGISTER y esté activo
   - Backend desactiva el registro (active: false) para evitar reutilización
   - Backend responde con éxito
   - ✅ **Ahora el usuario puede iniciar sesión**

4. **Inicio de Sesión**
   - Usuario envía POST a `/auth/login` con email y password
   - Sistema valida credenciales
   - **Sistema verifica que NO exista un registro UserRecovery con type REGISTER y active: true**
   - Si existe (cuenta no activada), retorna error: "Account not activated. Please check your email and activate your account."
   - Si no existe o está inactivo (cuenta activada), permite el login

## Template de Email de SendGrid (Opcional)

Si deseas usar un template personalizado en SendGrid, crea uno con estas variables dinámicas:

- `{{firstName}}` - Nombre del usuario
- `{{activationUrl}}` - URL completa de activación

Si no configuras `SENDGRID_ACTIVATION_TEMPLATE_ID`, se usará un HTML inline por defecto.

## Testing

### 1. Registrar un usuario
```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe",
    "address": "123 Main St",
    "phone": "+1234567890",
    "acceptTermsAndPolicies": true
  }'
```

### 2. Intentar login ANTES de activar (debe fallar)
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!"
  }'
# Respuesta esperada: Error "Account not activated. Please check your email and activate your account."
```

### 3. Verificar que se creó el registro en UserRecovery
```sql
SELECT * FROM "UserRecovery" WHERE type = 'REGISTER' AND active = true;
```

### 4. Activar cuenta
```bash
curl -X POST http://localhost:3000/users/activate \
  -H "Content-Type: application/json" \
  -d '{
    "hash": "hash_obtenido_del_email"
  }'
```

### 6. Verificar que se desactivó el registro
```sql
SELECT * FROM "UserRecovery" WHERE type = 'REGISTER' AND active = false;
```

### 7. Intentar login DESPUÉS de activar (debe funcionar)
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!"
  }'
# Respuesta esperada: Tokens de acceso y refresh
```

## Seguridad

- Hash generado con `crypto.randomBytes(32).toString('hex')` (64 caracteres)
- Hash único por usuario
- El hash se desactiva después del primer uso
- ✅ **Expiración de links**: Los links expiran según `APP_ACTIVATION_ACCOUNT_EXPIRE`
- ✅ **Validación temporal**: Compara `createdAt` del UserRecovery con tiempo actual
- Rate limiting en ambos endpoints (registro y activación)
- Validación de tipo de recuperación (debe ser REGISTER)
- ✅ **Bloqueo de login hasta activar cuenta**: El LoginUseCase verifica que no exista un registro UserRecovery activo de tipo REGISTER

## Configuración de Expiración

La expiración del link de activación se configura con la variable `APP_ACTIVATION_ACCOUNT_EXPIRE`:

| Formato | Descripción | Ejemplo |
|---------|-------------|---------|
| `Xh` | X horas | `1h`, `24h`, `48h` |
| `Xd` | X días | `1d`, `7d` |
| `Xm` | X minutos | `30m`, `60m` |

**Valor por defecto:** `24h` (24 horas)

**Recomendaciones:**
- Desarrollo: `24h` o `48h` para facilitar testing
- Producción: `24h` para balance entre seguridad y UX

## Estados de Activación

| Estado | UserRecovery.active | Expirado | Puede hacer login | Descripción |
|--------|---------------------|----------|-------------------|-------------|
| Registrado | true | No | ❌ NO | Usuario recién registrado, aún no ha activado su cuenta |
| Link expirado | true → false | Sí | ❌ NO | El link expiró, se marca como inactivo automáticamente |
| Activado | false | No | ✅ SÍ | Usuario activó su cuenta mediante el link del email |
| Sin registro | N/A | N/A | ✅ SÍ | No existe registro de activación (usuarios antiguos) |

## Notas Importantes

✅ **IMPLEMENTADO**: El sistema ahora bloquea el inicio de sesión hasta que el usuario active su cuenta mediante el email.

**Lógica de Validación en Login:**
- El LoginUseCase busca registros de UserRecovery con type: REGISTER para el usuario
- Si encuentra uno con active: true → La cuenta NO está activada → Bloquea el login
- Si encuentra uno con active: false → La cuenta está activada → Permite el login
- Si no encuentra ninguno → Usuario antiguo sin sistema de activación → Permite el login

## Próximos Pasos (Opcional)
- [x] ✅ Expiración de links de activación
- [ ] Endpoint para reenviar email de activación
- [ ] Notificación al usuario cuando su cuenta es activada
- [ ] Dashboard admin para ver cuentas pendientes de activación

