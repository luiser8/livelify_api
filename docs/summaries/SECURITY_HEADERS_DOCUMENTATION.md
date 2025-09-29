# 🔒 Security Headers - Documentación Completa

## 📋 **Resumen de Implementación**

Se han implementado **múltiples capas de seguridad** a través de cabeceras HTTP para proteger la API contra diversos tipos de ataques. La configuración utiliza **Helmet.js** y cabeceras personalizadas.

---

## 🛡️ **Cabeceras de Seguridad Implementadas**

### **1. 🚫 Content Security Policy (CSP)**
```http
Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; script-src 'self'; img-src 'self' data: https:; ...
```

**🎯 Protege contra:**
- Cross-Site Scripting (XSS)
- Inyección de código malicioso
- Carga de recursos desde dominios no autorizados

**⚙️ Configuración:**
- `default-src 'self'`: Solo recursos del mismo origen
- `style-src`: Estilos permitidos (incluye CDN para Swagger)
- `script-src`: Scripts restrictivos (eval permitido solo en desarrollo)
- `img-src`: Imágenes desde el mismo origen, data URLs y HTTPS

---

### **2. 🔒 HTTP Strict Transport Security (HSTS)**
```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**🎯 Protege contra:**
- Ataques de downgrade HTTPS → HTTP
- Man-in-the-middle attacks
- SSL stripping

**⚙️ Configuración:**
- `max-age=31536000`: 1 año de validez
- `includeSubDomains`: Aplica a subdominios
- `preload`: Eligible para HSTS preload list
- **Solo en producción**: Deshabilitado en desarrollo

---

### **3. 🖼️ X-Frame-Options**
```http
X-Frame-Options: DENY
```

**🎯 Protege contra:**
- Ataques de clickjacking
- Embedding malicioso en iframes
- UI redressing attacks

**⚙️ Configuración:**
- `DENY`: Prohíbe completamente el embedding

---

### **4. 🔍 X-Content-Type-Options**
```http
X-Content-Type-Options: nosniff
```

**🎯 Protege contra:**
- MIME type sniffing attacks
- Ejecución no deseada de contenido
- Vulnerabilidades de tipo de archivo

**⚙️ Configuración:**
- `nosniff`: Fuerza respeto a Content-Type declarado

---

### **5. ⚡ X-XSS-Protection**
```http
X-XSS-Protection: 1; mode=block
```

**🎯 Protege contra:**
- Cross-Site Scripting básico
- Ataques XSS reflejados
- Ejecución de scripts maliciosos

**⚙️ Configuración:**
- `1`: Habilita filtro XSS
- `mode=block`: Bloquea página en lugar de sanitizar

---

### **6. 🔗 Referrer-Policy**
```http
Referrer-Policy: strict-origin-when-cross-origin
```

**🎯 Protege contra:**
- Leakage de información sensible en URLs
- Tracking cross-origin no deseado
- Exposición de rutas internas

**⚙️ Configuración:**
- Envía referrer completo para same-origin
- Solo origin para cross-origin HTTPS
- No referrer para downgrades HTTP

---

### **7. 🎛️ Permissions-Policy**
```http
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=(), payment=(), usb=(), serial=(), bluetooth=()
```

**🎯 Protege contra:**
- Acceso no autorizado a APIs de dispositivo
- Tracking via browser features
- Activación maliciosa de hardware

**⚙️ Configuración:**
- Deniega acceso a todas las APIs sensibles
- Incluye protección contra FLoC y Topics API
- Bloquea APIs de hardware (USB, Bluetooth, etc.)

---

### **8. 🌐 Cross-Origin Policies**
```http
Cross-Origin-Resource-Policy: cross-origin
Cross-Origin-Opener-Policy: same-origin-allow-popups
```

**🎯 Protege contra:**
- Ataques Spectre/Meltdown
- Cross-origin information leaks
- Side-channel attacks

**⚙️ Configuración:**
- `cross-origin`: Permite requests cross-origin (necesario para API)
- `same-origin-allow-popups`: Controla window.opener

---

### **9. 📡 DNS Prefetch Control**
```http
X-DNS-Prefetch-Control: off
```

**🎯 Protege contra:**
- DNS leakage
- Performance fingerprinting
- Unintended network requests

**⚙️ Configuración:**
- Deshabilita DNS prefetching automático

---

## 🔧 **Cabeceras Personalizadas**

### **1. 📊 Server Information**
```http
Server: Livelify-API
```
- **Minimiza** información del servidor
- **Oculta** versiones de tecnologías
- **Personaliza** identificación

### **2. 🔢 API Version**
```http
X-API-Version: v1
```
- Informa versión de API
- Útil para debugging
- Facilita versionado

### **3. 📞 Security Contact**
```http
X-Security-Contact: security@livelify.com
```
- Proporciona contacto de seguridad
- Facilita reporte de vulnerabilidades
- Mejora transparencia

### **4. 💾 Cache Control (para rutas API)**
```http
Cache-Control: no-store, no-cache, must-revalidate, private
Pragma: no-cache
Expires: 0
```
- **Previene** caching de datos sensibles
- **Fuerza** validación en cada request
- **Protege** información confidencial

### **5. 📊 Rate Limiting Info**
```http
X-RateLimit-Policy: API rate limits apply
```
- Informa sobre límites de tasa
- Ayuda a debugging
- Establece expectativas

---

## 🌍 **Configuración por Ambiente**

### **🔧 Development**
```typescript
// Configuración relajada para desarrollo
hsts: false,                    // HTTPS no obligatorio
scriptSrc: ["'unsafe-eval'"],   // Permitido para hot reload
contentSecurityPolicy: {        // CSP relajado para dev tools
  // ...menos restrictivo
}
```

### **🚀 Production**
```typescript
// Configuración estricta para producción
hsts: {
  maxAge: 31536000,
  includeSubDomains: true,
  preload: true
},
scriptSrc: ["'self'"],         // Solo scripts propios
contentSecurityPolicy: {       // CSP muy restrictivo
  // ...máxima seguridad
}
```

### **🧪 QA/Staging**
```typescript
// Configuración intermedia para testing
hsts: true,                    // HSTS habilitado
scriptSrc: ["'self'"],         // Scripts restrictivos
contentSecurityPolicy: {       // CSP production-like
  // ...similar a producción
}
```

---

## 🧪 **Testing de Seguridad**

### **Script Automatizado**
```bash
# Ejecutar test completo de cabeceras
chmod +x test_security_headers.sh
./test_security_headers.sh
```

**El script verifica:**
- ✅ Presencia de todas las cabeceras de seguridad
- ✅ Ausencia de cabeceras sensibles (`X-Powered-By`, etc.)
- ✅ Configuración correcta de CORS
- ✅ Respuestas del servidor

### **Test Manual**
```bash
# Ver todas las cabeceras de respuesta
curl -I http://localhost:3000/api/v1

# Test específico de CSP
curl -I http://localhost:3000/api/v1/docs

# Test de CORS
curl -I -X OPTIONS \
  -H "Origin: https://malicious-site.com" \
  http://localhost:3000/api/v1/auth/login
```

---

## 📊 **Puntuación de Seguridad**

### **🎯 Objetivos de Seguridad**
- **Score Meta**: > 90% en security headers tests
- **Helmet.js**: ✅ Configurado con 12+ políticas
- **CSP**: ✅ Restrictivo pero funcional
- **HSTS**: ✅ Habilitado en producción
- **Hidden Headers**: ✅ Información sensible oculta

### **🔍 Validación Externa**
```bash
# Usar herramientas online para validación
# - Mozilla Observatory
# - Security Headers
# - CSP Evaluator
# - SSL Labs (para HSTS)
```

---

## 🚨 **Consideraciones de Seguridad**

### **⚠️ Limitaciones**
1. **CSP y Swagger**: Requiere `unsafe-eval` en desarrollo
2. **CORS**: Debe configurarse según dominios de frontend
3. **HSTS**: Solo efectivo en HTTPS
4. **Backwards Compatibility**: Algunas cabeceras no soportadas en navegadores antiguos

### **🔄 Mantenimiento**
1. **Actualizaciones regulares** de Helmet.js
2. **Revisión periódica** de políticas CSP
3. **Monitoreo** de violaciones CSP (si se implementa reporting)
4. **Testing continuo** con herramientas de security

### **📈 Mejoras Futuras**
1. **CSP Reporting**: Endpoint para recibir violaciones
2. **Rate Limiting**: Implementar throttling
3. **Security Headers Monitoring**: Alertas automáticas
4. **HPKP**: HTTP Public Key Pinning (si se requiere)

---

## ✅ **Estado Actual**

```typescript
SecurityStatus {
  implementation: "✅ Complete",
  headers: "12+ security headers",
  environment_specific: "✅ Dev/QA/Prod configs",
  testing: "✅ Automated test script",
  documentation: "✅ Complete guide",
  maintenance: "🔄 Ongoing"
}
```

**🎉 La API tiene una configuración de seguridad robusta y bien documentada, proporcionando múltiples capas de protección contra ataques comunes.**
