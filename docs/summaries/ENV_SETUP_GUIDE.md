# 🔧 Guía de Configuración de Variables de Entorno

## 📝 **Archivos .env Necesarios**

Necesitas crear manualmente los siguientes archivos en la raíz del proyecto:

### **🔧 .env.development**
```bash
# =================================
# DEVELOPMENT ENVIRONMENT VARIABLES
# =================================

# Application Configuration
APP_PORT=3000
APP_PREFIX=api
APP_VERSION=v1
APP_TITLE=Livelify API - Development
APP_DESCRIPTION=API for Livelify application in development mode
APP_SWAGGER_UI=true
APP_ENV=development

# Security Configuration
APP_ALLOWED_ORIGINS=http://localhost:3000;http://localhost:3001;http://localhost:4200

# JWT Configuration
APP_JWT_SECRET=dev_super_secret_jwt_key_change_in_production_32_chars_minimum
APP_JWT_EXPIRE=1h

# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/livelify_dev"
```

### **🧪 .env.qa**
```bash
# ========================
# QA ENVIRONMENT VARIABLES
# ========================

# Application Configuration
APP_PORT=3000
APP_PREFIX=api
APP_VERSION=v1
APP_TITLE=Livelify API - QA
APP_DESCRIPTION=API for Livelify application in QA mode
APP_SWAGGER_UI=true
APP_ENV=qa

# Security Configuration
APP_ALLOWED_ORIGINS=https://qa.livelify.com;https://qa-admin.livelify.com

# JWT Configuration
APP_JWT_SECRET=qa_jwt_secret_key_should_be_different_from_dev_and_prod_32_chars
APP_JWT_EXPIRE=2h

# Database Configuration
DATABASE_URL="postgresql://livelify_qa:qa_password@qa-db-server:5432/livelify_qa"
```

### **🚀 .env.production**
```bash
# ==============================
# PRODUCTION ENVIRONMENT VARIABLES
# ==============================

# Application Configuration
APP_PORT=3000
APP_PREFIX=api
APP_VERSION=v1
APP_TITLE=Livelify API
APP_DESCRIPTION=API for Livelify application
APP_SWAGGER_UI=false
APP_ENV=production

# Security Configuration
APP_ALLOWED_ORIGINS=https://livelify.com;https://app.livelify.com

# JWT Configuration - IMPORTANT: Change these in production!
APP_JWT_SECRET=CHANGE_THIS_TO_A_SECURE_SECRET_KEY_IN_PRODUCTION_MINIMUM_32_CHARACTERS
APP_JWT_EXPIRE=30m

# Database Configuration
DATABASE_URL="postgresql://livelify_prod:SECURE_PASSWORD@prod-db-server:5432/livelify_prod"
```

---

## 🔄 **Cómo Funciona la Carga de Variables**

### **1. Función getEnvFilePath()**
```typescript
function getEnvFilePath(): string {
  const environment = process.env.APP_ENV || process.env.NODE_ENV || 'development';
  return `.env.${environment}`;
}
```

### **2. ConfigModule con getEnvFilePath()**
```typescript
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: getEnvFilePath(), // ✅ Carga el .env correcto
  expandVariables: true,
}),
```

### **3. JwtModule con ConfigService**
```typescript
JwtModule.registerAsync({
  global: true,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    secret: configService.get<string>('APP_JWT_SECRET'), // ✅ Lee del .env
    signOptions: { 
      expiresIn: configService.get<string>('APP_JWT_EXPIRE', '1h'), // ✅ Con fallback
    },
  }),
}),
```

---

## 🎯 **Variables JWT Importantes**

### **APP_JWT_SECRET**
- **Desarrollo**: Puede ser cualquier string largo (32+ caracteres)
- **QA**: Diferente al de desarrollo
- **Producción**: ⚠️ **DEBE ser criptográficamente seguro**
- **Ejemplo seguro**: Generar con `openssl rand -base64 32`

### **APP_JWT_EXPIRE**
- **Desarrollo**: `1h` (1 hora) - cómodo para desarrollo
- **QA**: `2h` (2 horas) - tiempo para testing
- **Producción**: `30m` (30 minutos) - más seguro

---

## 🚀 **Scripts de Ejecución**

Los scripts en `package.json` ya están configurados:

```json
{
  "start:dev": "APP_ENV=development nest start --watch",
  "start:qa": "APP_ENV=qa nest start --watch", 
  "start:prod": "APP_ENV=production node dist/main"
}
```

### **Comandos de Ejecución**
```bash
# Desarrollo (carga .env.development)
npm run start:dev

# QA (carga .env.qa)
npm run start:qa

# Producción (carga .env.production)
npm run start:prod
```

---

## ✅ **Para Crear los Archivos**

**Paso 1**: Crea los archivos manualmente
```bash
touch .env.development
touch .env.qa  
touch .env.production
```

**Paso 2**: Copia el contenido correspondiente de arriba

**Paso 3**: Ajusta las variables según tu entorno

**Paso 4**: ⚠️ **NUNCA subas estos archivos a Git** (ya están en .gitignore)

---

## 🔐 **Seguridad**

### ✅ **Buenas Prácticas**
- Secretos JWT diferentes por ambiente
- URLs de base de datos específicas por ambiente  
- CORS configurado según ambiente
- Swagger solo en dev/qa, no en producción

### ⚠️ **Importante**
- Los archivos `.env` están en `.gitignore` por seguridad
- Comparte las variables de forma segura (no por chat/email)
- Rota los secretos JWT regularmente en producción

**🎉 ¡Con esta configuración, el JwtModule leerá correctamente las variables del ambiente específico!**
