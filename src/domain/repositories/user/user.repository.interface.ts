import { User } from '../../entities/user/user.entity';
import { UserId } from '../../value-objects/user/user-id.value-object';
import { Email } from '../../value-objects/user/email.value-object';
import { UserSubscriptionResponseDto } from 'src/presentation/dtos/subscription/user-subscription.dto';

export interface UserRepositoryInterface {
  // Basic CRUD operations
  save(user: User): Promise<User>;
  findById(id: UserId): Promise<User | null>;
  findSubscriptionById(id: UserId): Promise<UserSubscriptionResponseDto | null>;
  findByEmail(email: Email): Promise<User | null>;
  update(user: User): Promise<User>;
  delete(id: UserId): Promise<void>;

  // Query operations
  findAll(limit?: number, offset?: number): Promise<User[]>;
  existsByEmail(email: Email): Promise<boolean>;
  existsById(id: UserId): Promise<boolean>;

  // Business-specific queries
  findUsersWithProfiles(): Promise<User[]>;
  findUsersByCreationDate(from: Date, to: Date): Promise<User[]>;
  count(): Promise<number>;

  // Password management
  updatePassword(id: UserId, hashedPassword: string): Promise<void>;
}
