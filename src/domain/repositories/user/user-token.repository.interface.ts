import type { UserToken } from '../../entities/user/user-token.entity';
import type { UserId } from '../../value-objects/user/user-id.value-object';

export interface UserTokenRepositoryInterface {
  save(userToken: UserToken): Promise<UserToken>;
  findByUserId(userId: UserId): Promise<UserToken | null>;
  findByAccessToken(accessToken: string): Promise<UserToken | null>;
  findByRefreshToken(refreshToken: string): Promise<UserToken | null>;
  deleteByUserId(userId: UserId): Promise<void>;
  deleteExpiredTokens(): Promise<void>;
}
