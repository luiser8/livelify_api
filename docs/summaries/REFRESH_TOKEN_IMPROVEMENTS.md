# 🔄 Mejoras al Endpoint de Refresh Token

## ⚡ **Cambios Implementados**

### **1. 🔐 Autenticación Dual Requerida**

#### **Antes (Solo Refresh Token)**
```bash
curl -X POST /auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "REFRESH_TOKEN_AQUI"}'
```

#### **Después (Access Token + Refresh Token)**
```bash
curl -X POST /auth/refresh \
  -H "Authorization: Bearer ACCESS_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "REFRESH_TOKEN_AQUI"}'
```

### **2. 🛡️ Validaciones de Seguridad Mejoradas**

```typescript
// Nuevas validaciones en RefreshTokenUseCase:

// 1. Verificar que el usuario del access_token coincida con el refresh_token
if (request.userId && decoded.sub !== request.userId) {
  throw new Error('Access token and refresh token user mismatch');
}

// 2. Verificar que el token almacenado pertenece al mismo usuario
if (!storedToken.getUserId().equals(userId)) {
  throw new Error('Token ownership mismatch');
}
```

---

## 🔄 **Nuevo Flujo de Refresh**

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant JwtGuard
    participant RefreshUseCase
    participant DB

    Client->>API: POST /auth/refresh
    Note over Client,API: Headers: Authorization: Bearer access_token<br/>Body: {"refresh_token": "..."}
    
    API->>JwtGuard: Validate access_token
    JwtGuard->>DB: Check access_token in UserToken table
    JwtGuard-->>API: ✅ Access token valid
    
    API->>RefreshUseCase: execute(userId, refresh_token)
    RefreshUseCase->>RefreshUseCase: Verify refresh_token JWT
    RefreshUseCase->>RefreshUseCase: Validate user ID match
    RefreshUseCase->>DB: Find refresh_token in UserToken
    RefreshUseCase->>RefreshUseCase: Verify token ownership
    RefreshUseCase->>DB: Get user and profile data
    RefreshUseCase->>RefreshUseCase: Generate new tokens
    RefreshUseCase->>DB: Update stored tokens
    RefreshUseCase-->>API: New tokens
    API-->>Client: ✅ {access_token, refresh_token}
```

---

## 🔒 **Ventajas de Seguridad**

### **1. 🎯 Doble Validación**
- **Access Token**: Verifica que el usuario está autenticado
- **Refresh Token**: Proporciona los nuevos tokens

### **2. 🛡️ Prevención de Ataques**

#### **Ataque de Token Robado**
```bash
# ❌ Antes: Solo refresh token robado = acceso
curl -X POST /auth/refresh -d '{"refresh_token": "TOKEN_ROBADO"}'

# ✅ Después: Necesita AMBOS tokens
curl -X POST /auth/refresh \
  -H "Authorization: Bearer ACCESS_TOKEN_NECESARIO" \
  -d '{"refresh_token": "TOKEN_ROBADO"}'
```

#### **Protección contra Cross-User Attacks**
```typescript
// Evita que un usuario use el refresh token de otro usuario
if (accessTokenUserId !== refreshTokenUserId) {
  throw new Error('Token user mismatch');
}
```

### **3. 🔄 Consistencia con Otros Endpoints**
- **Antes**: `/auth/refresh` era el único endpoint público
- **Después**: Todos los endpoints requieren autenticación consistente

---

## 📝 **Documentación de API Actualizada**

### **Swagger Documentation**
```typescript
@ApiOperation({ 
  summary: 'Refresh access token using refresh token',
  description: 'Requires access token in Authorization header and refresh token in request body'
})
@ApiResponse({
  status: 200,
  description: 'Tokens refreshed successfully',
  type: RefreshTokenResponseDto,
})
@ApiResponse({
  status: 401,
  description: 'Unauthorized - invalid or expired tokens',
})
```

### **Request Requirements**
```typescript
// Headers
Authorization: Bearer <access_token>
Content-Type: application/json

// Body
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **Response**
```typescript
{
  "access_token": "new.access.token",
  "refresh_token": "new.refresh.token"
}
```

---

## 🧪 **Testing del Nuevo Endpoint**

### **Test 1: Refresh con Tokens Válidos**
```bash
# 1. Login para obtener tokens
LOGIN_RESPONSE=$(curl -s -X POST /auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "SecurePass123!"}')

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.refresh_token')

# 2. Refresh con ambos tokens
curl -X POST /auth/refresh \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\": \"$REFRESH_TOKEN\"}"

# ✅ Debería retornar nuevos tokens
```

### **Test 2: Refresh sin Access Token (Error)**
```bash
curl -X POST /auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "REFRESH_TOKEN"}'

# ❌ 401 Unauthorized: Access token is required
```

### **Test 3: Tokens de Diferentes Usuarios (Error)**
```bash
# Usar access_token del Usuario A con refresh_token del Usuario B
curl -X POST /auth/refresh \
  -H "Authorization: Bearer ACCESS_TOKEN_USER_A" \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "REFRESH_TOKEN_USER_B"}'

# ❌ 401 Unauthorized: Access token and refresh token user mismatch
```

---

## 📊 **Comparación: Antes vs Después**

| Aspecto | ❌ Antes | ✅ Después |
|---------|----------|------------|
| **Autenticación** | Solo refresh token | Access + Refresh tokens |
| **Seguridad** | Vulnerable a token robado | Protegido contra robo parcial |
| **Validación** | Solo JWT + BD | JWT + BD + Ownership |
| **Consistencia** | Endpoint especial | Consistente con otros |
| **Protección** | Cross-user vulnerable | Cross-user protegido |
| **Documentación** | Básica | Completa con ejemplos |

---

## 🚨 **Casos de Error Mejorados**

### **1. 🔐 Token de Acceso Inválido**
```json
{
  "message": "Invalid or expired token",
  "error": "Unauthorized",
  "statusCode": 401
}
```

### **2. 🔄 Refresh Token Inválido**
```json
{
  "message": "Invalid or expired refresh token",
  "error": "Unauthorized", 
  "statusCode": 401
}
```

### **3. 👤 Mismatch de Usuarios**
```json
{
  "message": "Access token and refresh token user mismatch",
  "error": "Unauthorized",
  "statusCode": 401
}
```

### **4. 🛡️ Ownership Mismatch**
```json
{
  "message": "Token ownership mismatch",
  "error": "Unauthorized",
  "statusCode": 401
}
```

---

## ✅ **Beneficios del Nuevo Diseño**

### **🔒 Seguridad**
- Protección contra robo parcial de tokens
- Validación cruzada de ownership
- Prevención de ataques cross-user

### **🎯 Consistencia**
- Todos los endpoints requieren autenticación
- Patrones uniformes de autorización
- Manejo consistente de errores

### **📝 Documentación**
- Swagger actualizado con ejemplos
- Casos de error bien documentados
- Guías de testing incluidas

### **🛡️ Robustez**
- Múltiples capas de validación
- Detección temprana de anomalías
- Logs detallados para auditoría

---

**🎯 Resultado: Refresh token mucho más seguro y consistente con el resto de la API.**
