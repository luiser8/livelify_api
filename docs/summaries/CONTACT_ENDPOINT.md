# Endpoint de Contactos - Resumen

## Fecha
Noviembre 29, 2025

## Objetivo
Crear un nuevo endpoint `POST /contacts/add` similar al de Diagnostic pero que solo registre contactos en SendGrid **sin enviar correo electrónico**.

## Archivos Creados

### 1. Use Case
**Archivo:** `src/application/use-cases/contact/add-contact.use-case.ts`

**Funcionalidad:**
- Solo agrega contactos a la lista de SendGrid Marketing
- NO envía correos electrónicos
- Retorna el estado de la operación

**Request Interface:**
```typescript
{
  name: string;
  email: string;
}
```

**Response Interface:**
```typescript
{
  success: boolean;
  message: string;
  addedToSendGrid: boolean;
}
```

### 2. DTO
**Archivos:**
- `src/presentation/dtos/contact/add-contact.dto.ts`
- `src/presentation/dtos/contact/index.ts`

**Validaciones:**
- Email debe ser válido
- Nombre y email son obligatorios

### 3. Controller
**Archivo:** `src/presentation/controllers/contact.controller.ts`

**Endpoint:**
```
POST /contacts/add
```

**Características:**
- ✅ Endpoint público (no requiere autenticación JWT)
- 🔐 Requiere API Key en header `X-Api-Key`
- 🌐 Rate limiting aplicado
- 📝 Documentado en Swagger

**Headers requeridos:**
```
X-Api-Key: your-api-key-here
Content-Type: application/json
```

**Body ejemplo:**
```json
{
  "name": "Luis Rondon",
  "email": "leduardo.rondon@gmail.com"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Contact added to SendGrid successfully",
  "addedToSendGrid": true
}
```

## Diferencias con Diagnostic

| Característica | Diagnostic (/diagnostic/send) | Contacts (/contacts/add) |
|---------------|-------------------------------|--------------------------|
| Agrega a SendGrid | ✅ Sí | ✅ Sí |
| Envía correo | ✅ Sí | ❌ No |
| Campos personalizados SendGrid | ✅ Sí | ✅ Sí |
| Requiere API Key | ✅ Sí | ✅ Sí |
| Rate limiting | ✅ Sí | ✅ Sí |
| Endpoint público | ✅ Sí | ✅ Sí |

## Campos Personalizados en SendGrid

El siguiente campo se guarda en SendGrid Marketing:
- `nombre_cliente`: Nombre completo del contacto

## Módulos Actualizados

1. ✅ `src/application/application.module.ts`
   - Agregado `AddContactUseCase` a providers y exports

2. ✅ `src/presentation/presentation.module.ts`
   - Agregado `ContactController` a controllers
   - Agregado `AddContactUseCase` a providers

## Uso desde el Frontend

```javascript
// Ejemplo de llamada desde el sitio de ventas
async function addContact(contactData) {
  const response = await fetch('https://api.livelify.com/contacts/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': 'your-api-key-here'
    },
    body: JSON.stringify({
      name: contactData.name,
      email: contactData.email
    })
  });

  const result = await response.json();
  
  if (result.success) {
    console.log('✅ Contacto agregado a SendGrid');
  } else {
    console.error('❌ Error al agregar contacto');
  }
}
```

## Testing

### Prueba con cURL:

```bash
curl -X POST http://localhost:3000/contacts/add \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: your-api-key-here" \
  -d '{
    "name": "Luis Rondon",
    "email": "test@example.com"
  }'
```

## Swagger Documentation

El endpoint está completamente documentado en Swagger:
- Accede a `/api` para ver la documentación interactiva
- Busca la sección "Contacts"
- Encuentra el endpoint "Add contact to SendGrid marketing list"

## Ventajas del Nuevo Endpoint

1. **Más Eficiente:** No envía correos, solo registra en SendGrid
2. **Menos Costoso:** Ahorra créditos de correo de SendGrid
3. **Más Rápido:** Menos operaciones = respuesta más rápida
4. **Flexible:** Puedes enviar correos después desde SendGrid con campañas

## Manejo de Errores

El endpoint maneja errores de manera similar a Diagnostic:
- Si falla agregar a SendGrid, retorna error 500
- Los errores se registran en consola para debugging
- Validaciones de datos se manejan a nivel de DTO

## Próximos Pasos

1. ✅ Verificar que la API Key esté configurada correctamente
2. ✅ Probar el endpoint con datos reales
3. ✅ Configurar los custom fields en SendGrid si no existen
4. ✅ Integrar con el sitio de ventas
5. ✅ Monitorear los logs para verificar que funciona correctamente

## Notas Importantes

- El endpoint **NO envía correos**, solo registra contactos
- Los contactos se agregan a la lista configurada en SendGrid Marketing
- Asegúrate de que los custom fields existan en SendGrid antes de usar
- El API Key debe ser el mismo que usa Diagnostic
