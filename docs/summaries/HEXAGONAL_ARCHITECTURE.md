# 🏗️ Arquitectura Hexagonal con NestJS y Prisma

Esta API implementa **Arquitectura Hexagonal** (también conocida como **Ports & Adapters**) para lograr máxima separación de responsabilidades, testabilidad y mantenibilidad.

## 📁 Estructura de Carpetas

```
src/
├── domain/                     # 🟡 DOMINIO (Core Business Logic)
│   ├── entities/              # Entidades de dominio
│   ├── value-objects/         # Value Objects inmutables
│   ├── repositories/          # Interfaces de repositorios (Puertos)
│   ├── services/              # Servicios de dominio
│   └── events/                # Eventos de dominio
│
├── application/               # 🔵 APLICACIÓN (Use Cases)
│   ├── use-cases/            # Casos de uso de la aplicación
│   └── ports/                # Tokens de inyección de dependencias
│
├── infrastructure/           # 🔴 INFRAESTRUCTURA (Adapters)
│   ├── database/             # Cliente Prisma
│   ├── repositories/         # Implementaciones de repositorios
│   ├── adapters/             # Adaptadores externos
│   └── config/               # Configuración de módulos
│
└── presentation/             # 🟢 PRESENTACIÓN (Controllers & DTOs)
    ├── controllers/          # Controladores REST
    ├── dtos/                 # Data Transfer Objects
    ├── guards/               # Guards de autenticación/autorización
    └── decorators/           # Decoradores personalizados
```

## 🎯 Principios de Arquitectura Hexagonal

### 1. **Inversión de Dependencias**
- El dominio **NO** depende de infraestructura
- La infraestructura implementa las interfaces del dominio
- Las dependencias apuntan hacia adentro (hacia el dominio)

### 2. **Puertos y Adaptadores**
- **Puertos**: Interfaces que define el dominio
- **Adaptadores**: Implementaciones concretas en infraestructura

### 3. **Separación de Responsabilidades**
- **Dominio**: Lógica de negocio pura
- **Aplicación**: Orquestación de casos de uso
- **Infraestructura**: Detalles técnicos (BD, API, etc.)
- **Presentación**: Interfaz con el exterior

## 🔄 Flujo de Datos

```
HTTP Request → Controller → Use Case → Domain Entity → Repository Interface
                ↑              ↓           ↓              ↓
            Response ← DTO ← Domain ← Repository Implementation
```

## 💡 Ejemplo de Implementación: User

### 1. **Domain Layer**

#### Value Objects
```typescript
// src/domain/value-objects/email.value-object.ts
export class Email {
  constructor(private readonly value: string) {
    if (!this.isValid(email)) {
      throw new Error('Invalid email format');
    }
  }
  
  private isValid(email: string): boolean {
    // Validación de email
  }
}
```

#### Entities
```typescript
// src/domain/entities/user.entity.ts
export class User {
  constructor(
    private readonly _id: UserId,
    private _email: Email,
    private _password: Password
  ) {}
  
  // Business methods
  public changeEmail(newEmail: Email): void {
    this._email = newEmail;
  }
}
```

#### Repository Interfaces (Ports)
```typescript
// src/domain/repositories/user.repository.interface.ts
export interface UserRepositoryInterface {
  save(user: User): Promise<User>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
}
```

### 2. **Application Layer**

#### Use Cases
```typescript
// src/application/use-cases/user/create-user.use-case.ts
@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // 1. Validar reglas de negocio
    // 2. Crear entidad de dominio
    // 3. Persistir entidad
    // 4. Retornar respuesta
  }
}
```

### 3. **Infrastructure Layer**

#### Repository Implementation (Adapter)
```typescript
// src/infrastructure/repositories/user.repository.ts
@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<User> {
    const userData = user.toPlainObject();

    const savedUser = await this.prisma.user.create({
      data: userData,
    });

    return this.toDomainEntity(savedUser);
  }
}
```

### 4. **Presentation Layer**

#### Controllers
```typescript
// src/presentation/controllers/user.controller.ts
@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
  ) {}

  @Post()
  async createUser(@Body() dto: CreateUserDto): Promise<CreateUserResponseDto> {
    return this.createUserUseCase.execute({
      email: dto.email,
      password: dto.password,
    });
  }
}
```

## 🔧 Configuración de Inyección de Dependencias

### Tokens
```typescript
// src/application/ports/tokens.ts
export const USER_REPOSITORY_TOKEN = 'UserRepositoryInterface';
```

### Módulos
```typescript
// src/infrastructure/config/repository.module.ts
@Module({
  providers: [
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserRepository,
    },
  ],
  exports: [USER_REPOSITORY_TOKEN],
})
export class RepositoryModule {}
```

## 🚀 Endpoints Disponibles

### Users
- `POST /api/v1/users` - Crear usuario
- `GET /api/v1/users/:id` - Obtener usuario por ID
- `POST /api/v1/users/authenticate` - Autenticar usuario
- `PUT /api/v1/users/:id/profile` - Actualizar perfil de usuario

## 🧪 Testing

La arquitectura hexagonal facilita el testing:

```typescript
describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockRepository: jest.Mocked<UserRepositoryInterface>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findByEmail: jest.fn(),
    } as any;

    useCase = new CreateUserUseCase(mockRepository);
  });

  it('should create a user', async () => {
    // Test implementation
  });
});
```

## 💪 Beneficios de esta Arquitectura

1. **Testabilidad**: Fácil mocking de dependencias
2. **Mantenibilidad**: Separación clara de responsabilidades
3. **Escalabilidad**: Fácil agregar nuevas funcionalidades
4. **Independencia de Framework**: El dominio es agnóstico
5. **Independencia de Base de Datos**: Cambiar Prisma por otro ORM es sencillo
6. **Principios SOLID**: Cada capa tiene una responsabilidad única

## 🔄 Extensiones Futuras

Para agregar nuevas funcionalidades (ej: LifeWheel):

1. Crear entidades en `domain/entities/`
2. Definir repositorios en `domain/repositories/`
3. Implementar casos de uso en `application/use-cases/`
4. Crear repositorio concreto en `infrastructure/repositories/`
5. Agregar controlador en `presentation/controllers/`
6. Configurar inyección de dependencias

## 📚 Referencias

- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [DDD with NestJS](https://docs.nestjs.com/recipes/cqrs)
