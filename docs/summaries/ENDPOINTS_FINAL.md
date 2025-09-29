# 🎯 API Endpoints - Estructura Final

## 🔐 **AuthController** `/api/v1/auth`

### 🔓 **Endpoints Públicos**

#### 1. **Login**
```
POST /api/v1/auth/login
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```
**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "accessToken": "jwt.access.token",
  "refreshToken": "jwt.refresh.token",
  "tokenType": "Bearer",
  "expiresIn": "1h"
}
```

#### 2. **Refresh Token**
```
POST /api/v1/auth/refresh
```
**Body:**
```json
{
  "refreshToken": "jwt.refresh.token"
}
```
**Response:**
```json
{
  "accessToken": "new.jwt.access.token",
  "refreshToken": "new.jwt.refresh.token",
  "tokenType": "Bearer",
  "expiresIn": "1h"
}
```

### 🔒 **Endpoints Protegidos**

#### 3. **Logout**
```
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
```
**Response:**
```json
{
  "message": "Successfully logged out",
  "success": true
}
```

---

## 👤 **UserController** `/api/v1/users`

### 🔓 **Endpoints Públicos**

#### 1. **Register**
```
POST /api/v1/users/register
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "address": "123 Main St, City, Country",
  "phone": "+1234567890",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```
**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "profile": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "address": "123 Main St, City, Country",
    "phone": "+1234567890",
    "avatarUrl": "https://example.com/avatar.jpg"
  },
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

### 🔒 **Endpoints Protegidos**

#### 2. **Me (Current User)**
```
GET /api/v1/users/me
Authorization: Bearer <access_token>
```
**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "profile": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "address": "123 Main St, City, Country",
    "phone": "+1234567890",
    "avatarUrl": "https://example.com/avatar.jpg"
  },
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### 3. **Update Profile**
```
PUT /api/v1/users/update
Authorization: Bearer <access_token>
```
**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "address": "456 New St, City, Country",
  "phone": "+1234567890",
  "avatarUrl": "https://example.com/new-avatar.jpg"
}
```
**Response:**
```json
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "fullName": "John Doe",
  "address": "456 New St, City, Country",
  "phone": "+1234567890",
  "avatarUrl": "https://example.com/new-avatar.jpg",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

---

## 📚 **Documentación**
```
GET /api/v1/docs
```

---

## 🔄 **Flujo Completo de Usuario**

### 1. **Registro**
```bash
curl -X POST http://localhost:3000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "address": "123 Main St",
    "phone": "+1234567890"
  }'
```

### 2. **Login**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### 3. **Ver Perfil**
```bash
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer <access_token>"
```

### 4. **Actualizar Perfil**
```bash
curl -X PUT http://localhost:3000/api/v1/users/update \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John Updated",
    "lastName": "Doe Updated",
    "address": "456 New St",
    "phone": "+0987654321"
  }'
```

### 5. **Refrescar Token**
```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refresh_token>"
  }'
```

### 6. **Logout**
```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer <access_token>"
```

---

## ✨ **Características**

### 🔐 **Autenticación**
- ✅ JWT Access Token (1h)
- ✅ JWT Refresh Token (7d)
- ✅ Logout funcional
- ✅ Token refresh automático

### 👤 **Gestión de Usuario**
- ✅ Registro con perfil completo
- ✅ Ver perfil propio
- ✅ Actualizar perfil propio
- ✅ Validaciones completas

### 🛡️ **Seguridad**
- ✅ Contraseñas hasheadas (bcrypt)
- ✅ Guards JWT automáticos
- ✅ Endpoints públicos marcados
- ✅ CORS configurado

### 📖 **Documentación**
- ✅ Swagger UI completo
- ✅ DTOs documentados
- ✅ Ejemplos de request/response
- ✅ Errores documentados

**🎉 API limpia y bien organizada!**
