# 📧 Integración de SendGrid Marketing

## 📋 Resumen

Se ha implementado la integración con SendGrid Marketing para agregar automáticamente los contactos que completan el diagnóstico de la Rueda de la Vida a una lista de marketing en SendGrid.

## 🏗️ Arquitectura

La integración sigue la **arquitectura hexagonal** del proyecto:

```
application/
├── ports/
│   └── sendgrid-marketing.ts          # Interface del servicio
└── use-cases/diagnostic/
    └── send-diagnostic.use-case.ts    # Integración con SendGrid

infrastructure/
├── adapters/
│   └── sendgrid-marketing/
│       └── sendgrid-marketing.adapter.ts  # Implementación con @sendgrid/client
└── config/
    └── services.module.ts             # Registro del servicio
```

## ⚙️ Configuración

### 1. Variable de Entorno

Solo necesitas configurar **una variable de entorno**:

```env
# -----------------------------------------------------------------------------
# SENDGRID MARKETING CONFIGURATION
# -----------------------------------------------------------------------------
# SendGrid API Key for marketing contacts
SENDGRID_API_KEY=a128151e-d55b-4546-91a0-95ff9b3c1734
```

### 2. List ID (Hardcodeado en el código)

El List ID está hardcodeado en el archivo:
`src/infrastructure/adapters/sendgrid-marketing/sendgrid-marketing.adapter.ts`

```typescript
private readonly listId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'; // TODO: Reemplazar
```

**Para obtener tu List ID:**
1. Ve a [SendGrid Dashboard](https://app.sendgrid.com/)
2. Navega a **Marketing → Contacts**
3. Selecciona tu lista "Método LIBRE Landing"
4. Copia el List ID de la URL o detalles de la lista
5. Reemplaza en el código arriba

## 📊 Custom Fields en SendGrid

Asegúrate de crear los siguientes **Custom Fields** en SendGrid con los nombres exactos:

| Field Name | Type | Description |
|------------|------|-------------|
| `nombre_cliente` | Text | Nombre del cliente |
| `puntuacion_promedio` | Text | Puntuación promedio (ej: "7.1") |
| `score_desarrollo` | Number | Score de desarrollo personal |
| `score_profesional` | Number | Score profesional |
| `score_salud` | Number | Score de salud |
| `score_finanzas` | Number | Score de finanzas |
| `score_familia` | Number | Score de familia |
| `score_amor` | Number | Score de amor/pareja |

### Crear Custom Fields

1. Ve a **Marketing → Custom Fields**
2. Click en **Create New Field**
3. Ingresa el nombre exacto (por ejemplo: `nombre_cliente`)
4. Selecciona el tipo (Text o Number)
5. Guarda el campo
6. Repite para todos los campos

## 🚀 Funcionamiento

### Flujo Completo

Cuando un usuario envía su diagnóstico a través del endpoint `POST /api/v1/diagnostic/send`:

1. **Guardar en PostgreSQL** ✅
   - Se crea y guarda el diagnóstico en la base de datos

2. **Agregar a SendGrid** ✅ (nuevo)
   - Se envía el contacto con sus datos a SendGrid
   - Se agrega o actualiza en la lista de marketing
   - **No bloquea el flujo principal** si falla

3. **Generar PDF** ✅
   - Se genera el PDF con los resultados (si email está habilitado)

4. **Enviar Email** ✅
   - Se envía el email con el PDF adjunto (si email está habilitado)

### Response del Endpoint

```json
{
  "success": true,
  "message": "Diagnostic saved and email sent successfully",
  "diagnosticId": "550e8400-e29b-41d4-a716-446655440000",
  "emailSent": true,
  "addedToSendGrid": true
}
```

## 🐛 Troubleshooting

**Si no se agrega a SendGrid:**

```
⚠️ SendGrid API Key not configured. Skipping contact addition.
```
→ Verifica que SENDGRID_API_KEY tenga valor en tu `.env`

## 📦 Dependencias

Se instaló el paquete oficial de SendGrid:

```json
{
  "dependencies": {
    "@sendgrid/client": "^8.1.6"
  }
}
```

## 🚀 Deployment en GCP

### 1. Crear el secreto en GCP Secret Manager

```bash
echo "a128151e-d55b-4546-91a0-95ff9b3c1734" | \
  gcloud secrets create SENDGRID_API_KEY \
  --project="livelifydev" \
  --replication-policy="automatic" \
  --data-file=-
```

### 2. El `cloudbuild.yaml` ya está configurado

Ya incluye `SENDGRID_API_KEY=SENDGRID_API_KEY:latest` en la lista de secretos.

### 3. Deploy

```bash
git push origin main
```

Cloud Build automáticamente desplegará con el secreto configurado.

---

## 🧪 Testing

### Test Manual

Puedes probar la integración enviando una request al endpoint:

```bash
curl -X POST https://your-api.com/api/v1/diagnostic/send \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Carlos Prueba",
    "email": "usuario.prueba@ejemplo.com",
    "average": 7.1,
    "scores": {
      "personal": 8,
      "professional": 9,
      "health": 6,
      "finances": 7,
      "family": 8,
      "love": 5
    }
  }'
```

### Verificar en SendGrid

1. Ve a **Marketing → Contacts**
2. Busca el email del usuario
3. Verifica que los custom fields tengan los valores correctos

## 📝 Logs

La integración genera logs útiles para debugging:

```
✅ Diagnostic saved in database: 550e8400-e29b-41d4-a716-446655440000
✅ Contact usuario.prueba@ejemplo.com successfully added to SendGrid list.
✅ Email sent to: usuario.prueba@ejemplo.com
```

O en caso de error:

```
⚠️ SendGrid not configured. Skipping contact addition.
❌ SendGrid error (non-blocking): API key is invalid
```

## 🎯 Beneficios

1. **Automatización**: Los contactos se agregan automáticamente a SendGrid
2. **Marketing**: Puedes crear campañas segmentadas basadas en los scores
3. **No bloqueante**: Si SendGrid falla, el usuario aún recibe su diagnóstico
4. **Actualización automática**: Si un usuario vuelve a hacer el diagnóstico, sus datos se actualizan

## 📈 Próximos Pasos

- [ ] Crear campañas de email automatizadas en SendGrid
- [ ] Segmentar contactos por rangos de puntuación
- [ ] Crear journeys personalizados según las áreas bajas
- [ ] Integrar con SendGrid Email para reemplazar Nodemailer (opcional)
- [ ] A/B testing de emails de follow-up

## 🔗 Referencias

- [SendGrid Marketing Contacts API](https://docs.sendgrid.com/api-reference/contacts/add-or-update-a-contact)
- [SendGrid Node.js Library](https://github.com/sendgrid/sendgrid-nodejs)
- [Custom Fields Documentation](https://docs.sendgrid.com/ui/managing-contacts/custom-fields)

