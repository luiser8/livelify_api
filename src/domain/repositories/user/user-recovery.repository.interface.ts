import { RecoveryType, UserRecovery } from '../../entities/user/user-recovery.entity';
import { UserId } from '../../value-objects/user/user-id.value-object';

export interface UserRecoveryRepositoryInterface {
  save(userRecovery: UserRecovery): Promise<UserRecovery>;
  create(data: any): Promise<UserRecovery>;
  findByUrlHash(
    urlHash: string,
    type: RecoveryType,
  ): Promise<UserRecovery | null>;
  findByHashAndType(
    hash: string,
    type: RecoveryType,
  ): Promise<UserRecovery | null>;
  findByUserId(userId: UserId): Promise<UserRecovery[]>;
  update(userRecovery: UserRecovery): Promise<UserRecovery>;
  deactivate(id: string): Promise<void>;
  deleteByUserId(userId: UserId): Promise<void>;
}
