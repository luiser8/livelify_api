# ✅ URLs Correctas de la API

## 🛠️ **Cambios Realizados**

### 1. **Ruta de Crear Usuario Actualizada**
- ❌ Antes: `POST /users`
- ✅ Ahora: `POST /api/v1/users/create`

### 2. **Configuración Swagger Corregida**
- Agregado servidor base en DocumentBuilder
- URLs en Swagger ahora muestran el prefijo correcto

## 🚀 **URLs Completas y Correctas**

### 🔓 **Endpoints Públicos**
```bash
# Crear usuario con perfil completo
POST http://localhost:3000/api/v1/users/create

# Login y obtener JWT token
POST http://localhost:3000/api/v1/users/login

# Autenticar (legacy)
POST http://localhost:3000/api/v1/users/authenticate
```

### 🔒 **Endpoints Protegidos (requieren JWT)**
```bash
# Obtener usuario por ID
GET http://localhost:3000/api/v1/users/:id

# Obtener perfil del usuario actual
GET http://localhost:3000/api/v1/users/profile/me

# Actualizar perfil de usuario específico
PUT http://localhost:3000/api/v1/users/:id/profile

# Actualizar perfil del usuario actual
PUT http://localhost:3000/api/v1/users/profile/me
```

### 📚 **Documentación**
```bash
# Swagger UI
GET http://localhost:3000/api/v1/docs
```

## 🧪 **Ejemplo de Uso Correcto**

### 1. **Crear Usuario** (✅ URL Corregida)
```bash
curl -X 'POST' \
  'http://localhost:3000/api/v1/users/create' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "address": "123 Main St, City, Country",
  "phone": "+1234567890",
  "avatarUrl": "https://example.com/avatar.jpg"
}'
```

### 2. **Login**
```bash
curl -X 'POST' \
  'http://localhost:3000/api/v1/users/login' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "user@example.com",
  "password": "SecurePass123!"
}'
```

### 3. **Usar Token JWT**
```bash
curl -X 'GET' \
  'http://localhost:3000/api/v1/users/profile/me' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN_HERE'
```

## 🔧 **Configuración Técnica**

### Variables de Entorno (.env.development)
```env
APP_PREFIX=api
APP_VERSION=v1
APP_PORT=3000
```

### Resultado Final
- **Base URL**: `http://localhost:3000`
- **Global Prefix**: `/api/v1`
- **Crear Usuario**: `/users/create`
- **URL Completa**: `http://localhost:3000/api/v1/users/create`

## ✅ **Verificación en Swagger**

Cuando abras `http://localhost:3000/api/v1/docs`, ahora verás:

1. **Servidor configurado**: `http://localhost:3000/api/v1`
2. **Endpoint correcto**: `POST /users/create`
3. **Request body completo** con todos los campos del perfil
4. **URLs correctas en los ejemplos curl**

¡Ahora todas las URLs están correctas! 🎉
