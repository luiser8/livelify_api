# 📧 Endpoint de Diagnóstico Público con PDF y Email

## 📋 Resumen

Se ha implementado un endpoint público que recibe diagnósticos de la rueda de la vida desde la web de ventas, genera un PDF con los resultados y lo envía por correo electrónico al usuario.

## 🏗️ Arquitectura

El feature sigue la **arquitectura hexagonal** del proyecto:

```
presentation/
├── dtos/diagnostic/
│   ├── send-diagnostic.dto.ts    # DTO de entrada
│   └── index.ts
└── controllers/
    └── diagnostic.controller.ts   # Controlador público

application/
├── ports/
│   ├── email.ts                   # Interface de email service
│   └── pdf-generator.ts           # Interface de PDF generator
└── use-cases/diagnostic/
    └── send-diagnostic.use-case.ts # Lógica de negocio

infrastructure/
├── adapters/
│   ├── email/
│   │   └── email.adapter.ts       # Implementación con Nodemailer
│   └── pdf-generator/
│       └── pdf-generator.adapter.ts # Implementación con PDFKit
└── config/
    └── services.module.ts         # Módulo de servicios
```

## 🚀 Endpoint

### POST `/api/v1/diagnostic/send`

**Características:**
- ✅ **Público** (no requiere autenticación)
- ✅ **Rate Limiting**: Nivel PUBLIC (1000 req/min)
- ✅ **Validación**: DTOs con class-validator
- ✅ **Documentación**: Swagger/OpenAPI

**Request Body:**
```json
{
  "scores": {
    "personal": 5,
    "professional": 10,
    "health": 3,
    "finances": 5,
    "family": 7,
    "love": 7
  },
  "name": "Luis Rondon",
  "email": "leduardo.rondon@gmail.com",
  "average": 6.2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Diagnostic sent successfully"
}
```

## 📦 Dependencias Instaladas

```bash
pnpm add nodemailer pdfkit
pnpm add -D @types/nodemailer @types/pdfkit
```

## ⚙️ Configuración de Variables de Entorno

Agregadas a todos los archivos de ambiente (`.env.development`, `.env.qa`, `.env.production`):

```env
# EMAIL/SMTP CONFIGURATION
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
SMTP_FROM=Livelify <noreply@livelify.com>
```

### 📝 Configuración para Gmail

Para usar Gmail como servidor SMTP:

1. Habilitar **autenticación de dos factores** en tu cuenta de Gmail
2. Generar una **contraseña de aplicación**:
   - Ir a: https://myaccount.google.com/apppasswords
   - Seleccionar "Correo" y tu dispositivo
   - Copiar la contraseña generada
3. Configurar las variables de entorno:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=tu-email@gmail.com
   SMTP_PASSWORD=xxxx-xxxx-xxxx-xxxx  # Contraseña de aplicación
   SMTP_FROM=Livelify <noreply@livelify.com>
   ```

### 📧 Otras opciones de SMTP

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

**Mailgun:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-password
```

## 📄 Generación de PDF

El PDF generado incluye:

- 🎨 **Header**: Título del diagnóstico
- 👤 **Información del usuario**: Nombre y email
- 📊 **Puntuación promedio**: Destacada y centrada
- 📈 **Gráficos de barras**: Para cada área con código de colores:
  - 🔴 Rojo (0-3): Necesita atención
  - 🟠 Naranja (4-6): Mejorable
  - 🟢 Verde (7-10): Excelente
- 📅 **Fecha de generación**
- 🏷️ **Branding**: Logo de Livelify

## 📧 Email HTML

El email enviado incluye:

- 🎨 **Diseño responsive**: Compatible con clientes de email
- 📊 **Resumen de puntuaciones**: En formato visual
- 🔗 **Call to Action**: Botón para comenzar con Livelify
- 📎 **PDF adjunto**: Con nombre único basado en timestamp

## 🔐 Seguridad

- ✅ **Validación de entrada**: DTOs con class-validator
- ✅ **Rate Limiting**: Nivel PUBLIC para evitar abuso
- ✅ **CORS**: Configurado en `main.ts`
- ✅ **Sanitización**: Email validado con regex
- ✅ **Error Handling**: Mensajes de error apropiados

## 🧪 Testing

### Prueba Manual

```bash
curl -X POST http://localhost:3000/api/v1/diagnostic/send \
  -H "Content-Type: application/json" \
  -d '{
    "scores": {
      "personal": 5,
      "professional": 10,
      "health": 3,
      "finances": 5,
      "family": 7,
      "love": 7
    },
    "name": "Luis Rondon",
    "email": "leduardo.rondon@gmail.com",
    "average": 6.2
  }'
```

### Testing con Swagger

1. Iniciar servidor: `pnpm start:dev`
2. Abrir: http://localhost:3000/api/v1/docs
3. Buscar endpoint: `POST /diagnostic/send`
4. Click en "Try it out"
5. Enviar request con data de ejemplo

## 📚 Documentación de la API

Disponible en Swagger: `http://localhost:3000/api/v1/docs`

El endpoint aparece en la sección **Diagnostic** con toda la documentación OpenAPI.

## 🔄 Flujo de Ejecución

1. **Request** → Controlador recibe el DTO
2. **Validación** → Class-validator valida la entrada
3. **Use Case** → Lógica de negocio coordina:
   - Generación de PDF (PDFKit)
   - Composición del email HTML
   - Envío del email con adjunto (Nodemailer)
4. **Response** → Confirmación de éxito

## 🛠️ Módulos Creados

### `ServicesModule`
Registra los adaptadores de infraestructura:
- `EmailAdapter` → `EMAIL_SERVICE_TOKEN`
- `PdfGeneratorAdapter` → `PDF_GENERATOR_SERVICE_TOKEN`

### Integración en módulos existentes

**ApplicationModule:**
- Importa `ServicesModule`
- Registra `SendDiagnosticUseCase`

**PresentationModule:**
- Importa `ApplicationModule`
- Registra `DiagnosticController`

## 🎯 Casos de Uso

Este endpoint es ideal para:
- 📊 **Landing pages** de captura de leads
- 🎁 **Lead magnets** (diagnóstico gratuito)
- 🔄 **Onboarding** de nuevos usuarios
- 📧 **Campañas de email marketing**
- 📱 **Apps móviles** sin autenticación

## 🚀 Deployment

### Variables de Entorno en Producción

Asegúrate de configurar las variables SMTP en:
- **Google Cloud** (si usas Cloud Run/GCP)
- **AWS** (Secrets Manager/Parameter Store)
- **Heroku** (Config Vars)
- **Docker** (compose o secrets)

### Consideraciones

1. ✅ **Límites de envío**: Verifica los límites de tu proveedor SMTP
2. ✅ **Tamaño de adjuntos**: PDF ~100KB por diagnóstico
3. ✅ **Rate Limiting**: Ajustar según capacidad del servidor
4. ✅ **Monitoreo**: Implementar logs y alertas para fallos de envío
5. ✅ **Costos**: Considerar costos de servicio SMTP (SendGrid, Mailgun, etc.)

## 📝 Mejoras Futuras

- [ ] Queue system (Bull/BullMQ) para envío asíncrono
- [ ] Templates de email personalizables
- [ ] Multiidioma (i18n) para emails y PDFs
- [ ] Caché de PDFs generados
- [ ] Analytics de apertura de emails
- [ ] Webhooks para notificar estado de envío
- [ ] Tests unitarios e integración
- [ ] Retry logic para envíos fallidos

## 📞 Soporte

Para más información sobre la arquitectura hexagonal del proyecto, consulta:
- `docs/summaries/HEXAGONAL_ARCHITECTURE.md`
- `docs/summaries/ENDPOINTS_FINAL.md`

---

**Creado:** Octubre 2025  
**Autor:** Luis Rondón  
**Proyecto:** Livelify API

