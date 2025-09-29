# 🔄 Verificación del Comportamiento UPSERT

## 📋 **Resumen del Comportamiento Esperado**

### **🆕 Caso 1: CREATE (Usuario sin token)**
```typescript
// Escenario: Usuario hace su PRIMER login
const user = await userRepository.findByEmail("user@example.com");
const existingToken = await userTokenRepository.findByUserId(user.id);
// existingToken === null (no hay token previo)

// Login ejecuta:
const newToken = UserToken.create(user.id, accessToken, refreshToken, expiresAt);
await userTokenRepository.save(newToken); // 🆕 CREATE

// Resultado en BD:
// INSERT INTO UserToken (id, userId, accessToken, refreshToken, expiresAt)
```

### **🔄 Caso 2: UPDATE (Usuario con token existente)**
```typescript
// Escenario: Usuario hace SEGUNDO login (o subsiguientes)
const user = await userRepository.findByEmail("user@example.com");
const existingToken = await userTokenRepository.findByUserId(user.id);
// existingToken !== null (token previo existe)

// Login ejecuta:
const newToken = UserToken.create(user.id, newAccessToken, newRefreshToken, newExpiresAt);
await userTokenRepository.save(newToken); // 🔄 UPDATE

// Resultado en BD:
// UPDATE UserToken SET accessToken=?, refreshToken=?, expiresAt=?, updatedAt=? 
// WHERE userId=?
```

---

## 🔧 **Implementación Técnica**

### **UserTokenRepository.save() - UPSERT Logic**
```typescript
async save(userToken: UserToken): Promise<UserToken> {
  const data = {
    userId: userToken.getUserId().getValue(),
    accessToken: userToken.getAccessToken(),
    refreshToken: userToken.getRefreshToken(),
    expiresAt: userToken.getExpiresAt(),
  };

  const savedToken = await this.prisma.userToken.upsert({
    where: {
      userId: userToken.getUserId().getValue(), // 🔑 Clave única
    },
    update: {
      // 🔄 Si existe: ACTUALIZAR estos campos
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt,
      updatedAt: new Date(),
    },
    create: {
      // 🆕 Si NO existe: CREAR con estos campos
      id: userToken.getId(),
      ...data,
    },
  });

  return this.toDomainEntity(savedToken);
}
```

### **Prisma UPSERT SQL Generado**
```sql
-- Prisma convierte el upsert en:

-- 1. Primero intenta hacer UPDATE
UPDATE "UserToken" 
SET "accessToken" = $1, "refreshToken" = $2, "expiresAt" = $3, "updatedAt" = $4
WHERE "userId" = $5;

-- 2. Si no afectó ninguna fila (no existe), hace INSERT
INSERT INTO "UserToken" ("id", "userId", "accessToken", "refreshToken", "expiresAt", "createdAt", "updatedAt")
VALUES ($1, $2, $3, $4, $5, $6, $7)
ON CONFLICT ("userId") DO UPDATE SET
  "accessToken" = EXCLUDED."accessToken",
  "refreshToken" = EXCLUDED."refreshToken", 
  "expiresAt" = EXCLUDED."expiresAt",
  "updatedAt" = EXCLUDED."updatedAt";
```

---

## 🧪 **Tests de Verificación**

### **Test 1: Primer Login (CREATE)**
```bash
# Script: test_upsert_behavior.sh
# Test 2: Primer LOGIN (debería CREAR nuevo registro)

✅ Login exitoso - Sesión 1
🔑 Access Token ID: ...AbC123Xy
🔄 Refresh Token ID: ...DeF456Zw
📊 Estado: PRIMER token creado en base de datos
```

### **Test 2: Segundo Login (UPDATE)**
```bash
# Test 4: Segundo LOGIN (debería REEMPLAZAR registro existente)

✅ Login exitoso - Sesión 2  
🔑 Access Token ID: ...GhI789Mn
🔄 Refresh Token ID: ...JkL012Pq
📊 Estado: SEGUNDO token debería haber reemplazado al primero
```

### **Test 3: Validación de Tokens**
```bash
# Test 5: Verificar tokens después del segundo login

Probando TOKEN 1 (...AbC123Xy) - Debería fallar:
❌ Token 1 (...AbC123Xy) NO FUNCIONA
✅ CORRECTO: Token anterior fue reemplazado/invalidado

Probando TOKEN 2 (...GhI789Mn) - Debería funcionar:
✅ Token 2 (...GhI789Mn) FUNCIONA  
✅ CORRECTO: Nuevo token funciona correctamente
```

---

## 🔍 **Puntos de Verificación**

### **1. 🗄️ A Nivel de Base de Datos**
```sql
-- Verificar que solo hay UN registro por usuario
SELECT COUNT(*) FROM "UserToken" WHERE "userId" = 'user-123';
-- Resultado esperado: 1 (siempre)

-- Verificar que el token es el más reciente
SELECT "accessToken", "updatedAt" FROM "UserToken" 
WHERE "userId" = 'user-123';
-- Debe coincidir con el último login
```

### **2. 🔧 A Nivel de Aplicación**
```typescript
// Verificar comportamiento del repositorio
const userToken1 = await userTokenRepository.findByUserId(userId);
console.log('Token inicial:', userToken1?.getAccessToken().slice(-8));

// Crear y guardar nuevo token
const newToken = UserToken.create(userId, newAccessToken, newRefreshToken, expiresAt);
await userTokenRepository.save(newToken); // UPSERT

// Verificar que fue reemplazado
const userToken2 = await userTokenRepository.findByUserId(userId);
console.log('Token después de upsert:', userToken2?.getAccessToken().slice(-8));

// userToken1.accessToken !== userToken2.accessToken ✅
```

### **3. 🔐 A Nivel de JWT Auth Guard**
```typescript
// El guard debe fallar para tokens antiguos
const oldTokenValid = await jwtAuthGuard.canActivate(requestWithOldToken);
// oldTokenValid === false ✅

// El guard debe pasar para el token actual
const newTokenValid = await jwtAuthGuard.canActivate(requestWithNewToken);  
// newTokenValid === true ✅
```

---

## 🎯 **Criterios de Éxito**

### **✅ Comportamiento CORRECTO**
1. **Primer login**: Crea registro en `UserToken`
2. **Logins subsiguientes**: Actualizan el mismo registro (mismo `userId`)
3. **Token anterior**: Queda invalidado automáticamente
4. **Solo un token**: Usuario tiene máximo 1 token activo
5. **Base de datos limpia**: No acumulación de tokens

### **❌ Comportamientos INCORRECTOS a evitar**
1. **Múltiples tokens**: Usuario con más de 1 registro en `UserToken`
2. **Tokens fantasma**: Tokens antiguos que siguen funcionando
3. **Acumulación**: Crecimiento ilimitado de registros por usuario
4. **Inconsistencia**: Estado diferente entre BD y aplicación

---

## 🚀 **Comando de Verificación Rápida**

```bash
# Ejecutar test completo del comportamiento UPSERT
chmod +x test_upsert_behavior.sh
./test_upsert_behavior.sh

# El script verificará:
# 1. Crear usuario único para test
# 2. Primer login (CREATE)
# 3. Verificar token funciona
# 4. Segundo login (UPDATE) 
# 5. Verificar token anterior NO funciona
# 6. Verificar token nuevo SÍ funciona
# 7. Tercer login (UPDATE again)
# 8. Verificación final de todos los tokens
```

---

## 📊 **Estado Actual del Sistema**

### **🔧 Configuración Técnica**
- ✅ **Schema**: `UserToken.userId` tiene constraint `@unique`
- ✅ **Migración**: Aplicada correctamente con índice único
- ✅ **Repositorio**: Implementa `upsert` usando `userId` como clave
- ✅ **Entidad**: `UserToken` con métodos `create` y `reconstitute`
- ✅ **Guard**: Verifica tokens en BD antes de autorizar

### **🎯 Comportamiento Garantizado**
```typescript
// GARANTÍA: Solo un token por usuario
interface TokenConstraint {
  userId: string;        // 🔑 Clave única 
  maxTokens: 1;         // 📊 Límite hard-coded por BD
  behavior: 'UPSERT';   // 🔄 CREATE si no existe, UPDATE si existe
  cleanup: 'automatic'; // 🧹 Auto-reemplazo en cada login
}
```

**🎉 El sistema está configurado correctamente para comportamiento UPSERT!**
