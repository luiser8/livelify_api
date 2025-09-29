import { UserProfile } from '../../entities/user/user-profile.entity';
import { UserId } from '../../value-objects/user/user-id.value-object';

export interface UserProfileRepositoryInterface {
  // Basic CRUD operations
  save(profile: UserProfile): Promise<UserProfile>;
  findById(id: string): Promise<UserProfile | null>;
  findByUserId(userId: UserId): Promise<UserProfile | null>;
  update(profile: UserProfile): Promise<UserProfile>;
  delete(id: string): Promise<void>;

  // Query operations
  findAll(limit?: number, offset?: number): Promise<UserProfile[]>;
  existsByUserId(userId: UserId): Promise<boolean>;

  // Business-specific queries
  searchByName(name: string): Promise<UserProfile[]>;
  findProfilesWithAvatar(): Promise<UserProfile[]>;
}
