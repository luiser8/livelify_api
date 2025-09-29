# 🔧 Solución: Error "Invalid or expired token"

## ❌ **Problema Identificado**
```json
{
  "message": "Invalid or expired token",
  "error": "Unauthorized", 
  "statusCode": 401
}
```

## 🔍 **Causas del Problema**

### **1. JwtAuthGuard usando process.env directamente**
```typescript
// ❌ PROBLEMA: process.env antes de cargar .env
const payload = await this.jwtService.verifyAsync(token, {
  secret: process.env.APP_JWT_SECRET, // undefined
});
```

### **2. Use Cases usando process.env directamente**  
```typescript
// ❌ PROBLEMA: Variables no cargadas
const decoded = await this.jwtService.verifyAsync(token, {
  secret: process.env.APP_JWT_SECRET, // undefined
});
```

### **3. Archivos .env faltantes**
- Falta `.env.development`
- Variables JWT no configuradas

---

## ✅ **Soluciones Implementadas**

### **1. 🔧 JwtAuthGuard con ConfigService**
```typescript
// ✅ SOLUCIÓN: ConfigService lee del .env correcto
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService, // ✅ Agregado
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const jwtSecret = this.configService.get<string>('APP_JWT_SECRET'); // ✅ Del .env
      if (!jwtSecret) {
        throw new UnauthorizedException('JWT secret not configured');
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtSecret, // ✅ Variable correcta
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
```

### **2. 🔧 Use Cases con ConfigService**

#### **LoginUseCase**
```typescript
@Injectable()
export class LoginUseCase {
  constructor(
    // ... otros repositorios
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService, // ✅ Agregado
  ) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    // ✅ Variables del .env correcto
    const accessTokenExpiresIn = this.configService.get<string>('APP_JWT_EXPIRE', '1h');
    
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: accessTokenExpiresIn, // ✅ Del ambiente
    });
  }
}
```

#### **RefreshTokenUseCase**
```typescript
@Injectable() 
export class RefreshTokenUseCase {
  constructor(
    // ... otros repositorios
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService, // ✅ Agregado
  ) {}

  async execute(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    // ✅ Secret del .env correcto
    const jwtSecret = this.configService.get<string>('APP_JWT_SECRET');
    
    const decoded = await this.jwtService.verifyAsync(token, {
      secret: jwtSecret, // ✅ Variable correcta
    });
  }
}
```

---

## 📁 **Configuración de Variables .env**

### **⚠️ IMPORTANTE: Crear archivos .env manualmente**

Los archivos `.env` están en `.gitignore` por seguridad, debes crearlos:

#### **1. Crear .env.development**
```bash
# Crear archivo
touch .env.development

# Agregar contenido:
APP_PORT=3000
APP_PREFIX=api
APP_VERSION=v1
APP_TITLE=Livelify API - Development
APP_DESCRIPTION=API for Livelify application in development mode
APP_SWAGGER_UI=true
APP_ENV=development

# CORS
APP_ALLOWED_ORIGINS=http://localhost:3000;http://localhost:3001;http://localhost:4200

# ✅ JWT CONFIGURATION (CRÍTICO)
APP_JWT_SECRET=dev_super_secret_jwt_key_change_in_production_32_chars_minimum
APP_JWT_EXPIRE=1h

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/livelify_dev"
```

#### **2. Crear .env.qa**
```bash
# Crear archivo
touch .env.qa

# Contenido similar pero con valores de QA:
APP_JWT_SECRET=qa_jwt_secret_key_should_be_different_from_dev_and_prod_32_chars
APP_JWT_EXPIRE=2h
```

#### **3. Crear .env.production**
```bash
# Crear archivo  
touch .env.production

# Contenido para producción:
APP_JWT_SECRET=CHANGE_THIS_TO_A_SECURE_SECRET_KEY_IN_PRODUCTION_MINIMUM_32_CHARACTERS
APP_JWT_EXPIRE=30m
APP_SWAGGER_UI=false
```

---

## 🔄 **Flujo de Carga de Variables**

### **Orden Correcto de Ejecución**
```mermaid
sequenceDiagram
    participant App as main.ts
    participant Config as ConfigModule
    participant JWT as JwtModule
    participant Guard as JwtAuthGuard
    participant UseCase as Auth Use Cases

    App->>Config: 1. ConfigModule.forRoot()
    Config->>Config: 2. getEnvFilePath() → .env.development
    Config->>Config: 3. Carga APP_JWT_SECRET y APP_JWT_EXPIRE
    
    App->>JWT: 4. JwtModule.registerAsync()
    JWT->>Config: 5. configService.get('APP_JWT_SECRET')
    Config-->>JWT: 6. Variable del .env
    
    Guard->>Config: 7. configService.get('APP_JWT_SECRET')
    Config-->>Guard: 8. Misma variable
    
    UseCase->>Config: 9. configService.get('APP_JWT_SECRET')
    Config-->>UseCase: 10. Misma variable
```

---

## 🧪 **Cómo Probar la Solución**

### **Paso 1: Verificar Variables**
```bash
# Iniciar en modo desarrollo
npm run start:dev

# Verificar que no aparezcan errores de JWT
# El log debería mostrar:
🚀 Livelify API started successfully!
📍 API: http://localhost:3000/api/v1  
📚 Docs: http://localhost:3000/api/v1/docs
🌍 Environment: development
📚 Swagger UI: http://localhost:3000/api/v1/docs
```

### **Paso 2: Probar Flujo Completo**

#### **A. Registrar Usuario**
```bash
curl -X POST http://localhost:3000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe", 
    "address": "123 Main St",
    "phone": "+1234567890"
  }'
```

#### **B. Login**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

**Respuesta esperada:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### **C. Usar Token**
```bash
# Copiar el access_token y usarlo:
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**✅ Debería devolver los datos del usuario sin error 401**

---

## 🚨 **Solución de Problemas**

### **❌ Error: "JWT secret not configured"**
**Causa**: Archivo `.env.development` no existe o no tiene `APP_JWT_SECRET`
**Solución**: Crear archivo `.env.development` con variables JWT

### **❌ Error: "Invalid or expired token" (persiste)**
**Causa**: El token se generó con un secret diferente al que se usa para verificar
**Solución**: 
1. Hacer login nuevamente para obtener token actualizado
2. Verificar que `APP_JWT_SECRET` sea el mismo en todo el flujo

### **❌ Error: "Cannot read properties of undefined"**
**Causa**: Variables de entorno no cargadas
**Solución**: Verificar que el archivo `.env` esté en la raíz del proyecto

### **❌ Swagger: "Access token is required"**
**Solución**: 
1. Hacer login en Swagger
2. Click "Authorize" 🔒
3. Pegar solo el `access_token` (sin "Bearer ")

---

## 🎯 **Resultado Final**

### **✅ Variables Cargadas Correctamente**
```typescript
// Todas usan ConfigService ahora:
configService.get<string>('APP_JWT_SECRET')  // ✅ Del .env.development
configService.get<string>('APP_JWT_EXPIRE')  // ✅ Del .env.development  
```

### **✅ JWT Tokens Funcionando**
- **Generación**: LoginUseCase con secret del .env
- **Verificación**: JwtAuthGuard con mismo secret del .env
- **Refresh**: RefreshTokenUseCase con mismo secret del .env

### **✅ Claims Completos**
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe", 
  "phone": "+1234567890",
  "type": "access",
  "iat": 1234567890,
  "exp": 1234571490
}
```

**🎉 ¡Error "Invalid or expired token" resuelto! Los JWT ahora funcionan correctamente con variables de entorno del archivo correcto.**
