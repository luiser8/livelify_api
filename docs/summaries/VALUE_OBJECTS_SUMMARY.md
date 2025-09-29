# 📦 Value Objects - Resumen Completo

## ✅ **Value Objects Implementados**

### **1. 🆔 UserId** (`user-id.value-object.ts`)
**Propósito**: Identificadores únicos de usuario
```typescript
const userId = UserId.create(); // Genera UUID automático
const userId = UserId.fromString("123e4567-e89b-12d3-a456-426614174000");
```

**Características**:
- ✅ Genera UUIDs automáticamente
- ✅ Validación de formato UUID
- ✅ Métodos `equals()`, `toString()`, `getValue()`

---

### **2. 📧 Email** (`email.value-object.ts`)
**Propósito**: Direcciones de correo electrónico válidas
```typescript
const email = new Email("user@example.com");
console.log(email.getValue()); // "user@example.com"
```

**Características**:
- ✅ Validación de formato de email
- ✅ Normalización automática (lowercase, trim)
- ✅ Regex completo para validación

---

### **3. 🔒 Password** (`password.value-object.ts`)
**Propósito**: Contraseñas seguras con hash y validación
```typescript
const password = new Password("SecurePass123!");
const hashedPassword = await password.hash();
const isValid = await hashedPassword.compare("SecurePass123!");
```

**Características**:
- ✅ Validación de complejidad (8+ chars, mayús/minús, número, especial)
- ✅ Hash con bcrypt (salt rounds: 12)
- ✅ Comparación segura de contraseñas
- ✅ Soporte para contraseñas ya hasheadas

---

### **4. 👤 Name** (`name.value-object.ts`)
**Propósito**: Nombres propios validados y formateados
```typescript
const firstName = new Name("john doe");
console.log(firstName.getValue()); // "John Doe"
console.log(firstName.getInitials()); // "JD"
```

**Características**:
- ✅ Validación 2-50 caracteres
- ✅ Formato automático (primera letra mayúscula)
- ✅ Soporte para caracteres internacionales (À-ÿ, etc.)
- ✅ Métodos `getInitials()`, `getLength()`
- ✅ Permite espacios, guiones, apostrofes, puntos

---

### **5. 📱 Phone** (`phone.value-object.ts`)
**Propósito**: Números telefónicos válidos con formato internacional
```typescript
const phone = new Phone("+1234567890");
console.log(phone.getFormattedNumber()); // "+1 123 456 7890"
console.log(phone.getCountryCode()); // "+1"
console.log(phone.getNationalNumber()); // "234567890"
```

**Características**:
- ✅ Soporte para formato internacional (+código país)
- ✅ Soporte para formato local (10+ dígitos)
- ✅ Parsing automático de código de país
- ✅ Formateo automático para display
- ✅ Validación de longitud (8-20 caracteres)

---

### **6. 🏠 Address** (`address.value-object.ts`)
**Propósito**: Direcciones válidas con parsing básico
```typescript
const address = new Address("123 Main St, New York, NY, USA");
console.log(address.getStreet()); // "123 Main St"
console.log(address.getCity()); // "New York"
console.log(address.getShortAddress()); // "123 Main St, New York"
```

**Características**:
- ✅ Validación 5-500 caracteres
- ✅ Parsing automático por comas
- ✅ Extracción de calle, ciudad, región, país
- ✅ Métodos `getShortAddress()`, `getFormattedAddress()`
- ✅ Validación de estructura básica

---

### **7. 🖼️ AvatarUrl** (`avatar-url.value-object.ts`)
**Propósito**: URLs de imágenes de avatar seguras
```typescript
const avatar = new AvatarUrl("https://example.com/avatar.jpg");
console.log(avatar.isSecure()); // true (HTTPS)
console.log(avatar.isImageFile()); // true
console.log(avatar.getThumbnailUrl(150)); // URL optimizada
```

**Características**:
- ✅ Solo HTTPS permitido
- ✅ Validación de extensiones de imagen (jpg, png, gif, webp, etc.)
- ✅ Soporte para servicios conocidos (Cloudinary, Imgur, etc.)
- ✅ Parsing de protocolo, dominio, path, extensión
- ✅ Generación de thumbnails para servicios conocidos
- ✅ Método `createOptional()` para URLs opcionales

---

## 🎯 **Casos de Uso de los Value Objects**

### **✅ En Entidades de Dominio**
```typescript
// UserProfile con value objects
export class UserProfile {
  private _firstName: Name;
  private _lastName: Name;
  private _phone: Phone;
  private _address: Address;
  private _avatarUrl?: AvatarUrl;
}
```

### **✅ En DTOs de Presentación**
```typescript
// Validación automática en DTOs
export class CreateUserDto {
  @IsEmail()
  email: string; // Se convierte a Email value object

  @MinLength(8)
  password: string; // Se convierte a Password value object
}
```

### **✅ En Casos de Uso**
```typescript
// Uso en aplicación
const email = new Email(request.email);
const password = new Password(request.password);
const firstName = new Name(request.firstName);
```

### **✅ En JWT Claims**
```typescript
// Claims con datos validados
const payload = {
  sub: user.id.getValue(),
  email: user.email.getValue(),
  firstName: userProfile.firstName.getValue(),
  lastName: userProfile.lastName.getValue(),
  phone: userProfile.phone.getValue(),
};
```

---

## 🛡️ **Beneficios de Seguridad y Validación**

### **🔐 Validación Automática**
- **Email**: Formato válido, normalización
- **Password**: Complejidad, hash seguro
- **Phone**: Formato internacional, longitud
- **Name**: Caracteres válidos, longitud
- **Address**: Estructura básica, longitud
- **AvatarUrl**: HTTPS, extensiones válidas

### **🎯 Type Safety**
```typescript
// Imposible pasar valores inválidos
function sendEmail(to: Email) { } // Solo acepta Email válido
function hashPassword(pwd: Password) { } // Solo acepta Password válido
```

### **🔄 Consistencia**
- Todos los value objects tienen `getValue()`, `equals()`, `toString()`
- Constructores validan automáticamente
- Inmutabilidad garantizada

### **🧪 Fácil Testing**
```typescript
// Tests simples y claros
expect(() => new Email("invalid")).toThrow();
expect(new Phone("+1234567890").getCountryCode()).toBe("+1");
expect(new Name("john").getValue()).toBe("John");
```

---

## 📊 **Estructura de Archivos**

```
src/domain/value-objects/
├── index.ts                    ✅ Exports centralizados
├── user-id.value-object.ts     ✅ Identificadores únicos
├── email.value-object.ts       ✅ Emails válidos
├── password.value-object.ts     ✅ Contraseñas seguras
├── name.value-object.ts         ✅ Nombres formateados
├── phone.value-object.ts        ✅ Teléfonos internacionales
├── address.value-object.ts      ✅ Direcciones válidas
└── avatar-url.value-object.ts   ✅ URLs de imagen seguras
```

**🎉 ¡Todos los Value Objects están implementados y listos para usar en toda la aplicación!**
