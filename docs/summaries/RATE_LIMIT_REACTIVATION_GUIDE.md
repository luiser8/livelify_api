# ⏰ Rate Limiting Reactivation Guide

## 📋 Resumen

El rate limiting en la API de Livelify se **reactiva automáticamente** después de que expira la ventana de tiempo (TTL). No requiere intervención manual.

## 🕐 Ventanas de Tiempo Actuales

### ⚙️ Configuración en docker-compose.yml

```yaml
# Default endpoints (consultas generales)
THROTTLE_TTL=60000        # 60,000ms = 1 minuto
THROTTLE_LIMIT=100        # 100 requests por minuto

# Auth endpoints (login, registro)  
THROTTLE_AUTH_TTL=900000  # 900,000ms = 15 minutos
THROTTLE_AUTH_LIMIT=5     # 5 intentos por 15 minutos

# Strict endpoints (actualizaciones, logout)
THROTTLE_STRICT_TTL=60000 # 60,000ms = 1 minuto  
THROTTLE_STRICT_LIMIT=10  # 10 requests por minuto
```

### 📊 Tabla de Reactivación

| Endpoint | Límite | Ventana | Cuándo se Reactiva |
|----------|--------|---------|-------------------|
| `POST /auth/login` | 5 requests | 15 minutos | ⏰ **Cada 15 minutos** |
| `POST /users/register` | 5 requests | 15 minutos | ⏰ **Cada 15 minutos** |
| `POST /auth/refresh` | 10 requests | 1 minuto | ⏰ **Cada 1 minuto** |
| `POST /auth/logout` | 10 requests | 1 minuto | ⏰ **Cada 1 minuto** |
| `PUT /users/update` | 10 requests | 1 minuto | ⏰ **Cada 1 minuto** |
| `GET /users/me` | 100 requests | 1 minuto | ⏰ **Cada 1 minuto** |

## 🔄 Mecanismo de Funcionamiento

### 1. **Algoritmo: Sliding Window**
```
Tiempo    │ Requests │ Estado
----------|----------|----------
10:00:00  │    1     │ ✅ Permitido
10:01:00  │    2     │ ✅ Permitido  
10:02:00  │    3     │ ✅ Permitido
10:03:00  │    4     │ ✅ Permitido
10:04:00  │    5     │ ✅ Permitido (último)
10:05:00  │    6     │ ❌ 429 Too Many Requests
10:06:00  │    7     │ ❌ 429 Too Many Requests
    ...   │   ...    │ ❌ Bloqueado
10:15:00  │ RESET    │ ⏰ Ventana expira
10:15:01  │    1     │ ✅ Permitido (reinicia)
```

### 2. **Headers de Respuesta**
Cada respuesta incluye información sobre el estado del rate limiting:

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 2
X-RateLimit-Reset: 2024-03-15T10:15:00.000Z
X-RateLimit-Policy: Multi-tier rate limiting active
```

### 3. **Cuando se Alcanza el Límite**
```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2024-03-15T10:15:00.000Z
Retry-After: 600

{
  "statusCode": 429,
  "message": "Rate limit exceeded. Too many requests from 192.168.1.100. Please try again later.",
  "error": "Too Many Requests"
}
```

## 📅 Ejemplos Prácticos

### 🔐 Ejemplo: Login Rate Limiting

```bash
# Escenario: Usuario intenta hacer login con credenciales incorrectas

# Intento 1 (10:00:00)
curl -X POST /api/v1/auth/login -d '{"email":"user@test.com","password":"wrong"}'
# Response: 401 Unauthorized ✅

# Intento 2 (10:01:00) 
curl -X POST /api/v1/auth/login -d '{"email":"user@test.com","password":"wrong"}'
# Response: 401 Unauthorized ✅

# Intento 3 (10:02:00)
curl -X POST /api/v1/auth/login -d '{"email":"user@test.com","password":"wrong"}'
# Response: 401 Unauthorized ✅

# Intento 4 (10:03:00)
curl -X POST /api/v1/auth/login -d '{"email":"user@test.com","password":"wrong"}'
# Response: 401 Unauthorized ✅

# Intento 5 (10:04:00)
curl -X POST /api/v1/auth/login -d '{"email":"user@test.com","password":"wrong"}'
# Response: 401 Unauthorized ✅ (último permitido)

# Intento 6 (10:05:00)
curl -X POST /api/v1/auth/login -d '{"email":"user@test.com","password":"wrong"}'
# Response: 429 Too Many Requests ❌

# ... Esperar hasta 10:15:00 (15 minutos después del primer intento)

# Intento 7 (10:15:01)
curl -X POST /api/v1/auth/login -d '{"email":"user@test.com","password":"wrong"}'
# Response: 401 Unauthorized ✅ (REACTIVADO AUTOMÁTICAMENTE)
```

### 📊 Ejemplo: Default Rate Limiting

```bash
# Escenario: Consultar perfil de usuario

# Requests 1-100 (10:00:00 - 10:00:59)
for i in {1..100}; do
  curl -X GET /api/v1/users/me -H "Authorization: Bearer token"
  # Response: 200 OK ✅
done

# Request 101 (10:00:59)
curl -X GET /api/v1/users/me -H "Authorization: Bearer token"
# Response: 429 Too Many Requests ❌

# Request 102 (10:01:00) - 1 minuto después
curl -X GET /api/v1/users/me -H "Authorization: Bearer token"  
# Response: 200 OK ✅ (REACTIVADO AUTOMÁTICAMENTE)
```

## 🧪 Testing de Reactivación

### Script Automatizado
```bash
# Ejecutar demo de reactivación
./scripts/tests/test_rate_limit_reactivation.sh
```

### Test Manual Rápido
```bash
# 1. Hacer múltiples requests hasta alcanzar el límite
for i in {1..15}; do
  curl -X POST /api/v1/auth/login -d '{"email":"test@test.com","password":"wrong"}' -w "Status: %{http_code}\n"
done

# 2. Esperar el TTL correspondiente
sleep 60  # Para endpoints default/strict
# sleep 900  # Para endpoints auth (15 minutos)

# 3. Probar que se reactivó
curl -X POST /api/v1/auth/login -d '{"email":"test@test.com","password":"wrong"}' -w "Status: %{http_code}\n"
```

## ⚡ Puntos Clave

### 🤖 **Automático**
- ✅ **No requiere intervención manual**
- ✅ **No hay comandos para "reiniciar" el rate limiting**
- ✅ **El sistema maneja todo automáticamente**

### ⏰ **Basado en Tiempo**
- ✅ **TTL = Time To Live (tiempo de vida)**
- ✅ **Contador se resetea cuando expira el TTL**
- ✅ **Timer inicia con el primer request**

### 🎯 **Por IP y Endpoint**
- ✅ **Cada IP tiene su propio contador**
- ✅ **Cada endpoint tiene su propio límite**
- ✅ **Rate limiting es independiente por tipo**

### 📊 **Monitoreable**
- ✅ **Headers informan estado actual**
- ✅ **`Retry-After` indica cuándo reintentar**
- ✅ **Logs registran violaciones**

## 🔧 Configuración Personalizada

### Cambiar Tiempos de Reactivación

Para cambiar los tiempos, modifica las variables en `docker-compose.yml`:

```yaml
# Hacer login más restrictivo (30 intentos cada hora)
- THROTTLE_AUTH_TTL=3600000  # 1 hora
- THROTTLE_AUTH_LIMIT=30     # 30 intentos

# Hacer endpoints más permisivos (500 requests cada 5 minutos)  
- THROTTLE_TTL=300000        # 5 minutos
- THROTTLE_LIMIT=500         # 500 requests
```

### Variables de Entorno
```bash
# Desarrollo (permisivo)
THROTTLE_AUTH_TTL=900000   # 15 minutos
THROTTLE_AUTH_LIMIT=5      # 5 intentos

# Producción (restrictivo)
THROTTLE_AUTH_TTL=900000   # 15 minutos  
THROTTLE_AUTH_LIMIT=2      # 2 intentos solamente
```

## 🚨 Mejores Prácticas

### Para Desarrolladores

1. **Manejar 429 Responses**
```javascript
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  console.log(`Rate limited. Retry after ${retryAfter} seconds`);
  
  // Implementar exponential backoff
  setTimeout(() => retryRequest(), retryAfter * 1000);
}
```

2. **Monitorear Headers**
```javascript
const remaining = response.headers.get('X-RateLimit-Remaining');
if (remaining < 5) {
  console.warn('Rate limit casi alcanzado');
}
```

### Para Administradores

1. **Monitorear Logs**
```bash
# Buscar violaciones de rate limiting
grep "Rate limit exceeded" /var/log/livelify-api.log
```

2. **Ajustar Límites**
```bash
# Analizar patrones de uso antes de cambiar límites
# Considerar impacto en UX vs seguridad
```

## 📈 Métricas y Monitoreo

### Headers Útiles
- `X-RateLimit-Limit`: Límite máximo
- `X-RateLimit-Remaining`: Requests restantes  
- `X-RateLimit-Reset`: Cuándo se resetea
- `Retry-After`: Segundos hasta poder reintentar

### Códigos de Estado
- `200/201`: Request exitoso
- `401`: Credenciales inválidas (no cuenta para rate limit si es por seguridad)
- `429`: Rate limit excedido
- `Retry-After`: Tiempo en segundos hasta reactivación

---

## 🎯 Resumen Ejecutivo

**¿Cuándo se reactiva?** ⏰ **Automáticamente** después del TTL:
- **Login/Registro**: Cada 15 minutos
- **Actualizaciones**: Cada 1 minuto  
- **Consultas**: Cada 1 minuto

**¿Qué hacer?** 🎯 **Nada** - el sistema se encarga automáticamente

**¿Cómo saberlo?** 📊 Monitorear headers `X-RateLimit-*` y `Retry-After`

---

*El rate limiting se reactiva automáticamente - ¡sin intervención necesaria!* ⚡
