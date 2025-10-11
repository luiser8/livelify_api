import { Injectable, Inject } from '@nestjs/common';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import type { UserTokenRepositoryInterface } from '../../../domain/repositories/user/user-token.repository.interface';
import { USER_TOKEN_REPOSITORY_TOKEN } from '../../ports/tokens';

export interface LogoutRequest {
  userId: string;
}

export interface LogoutResponse {
  message: string;
  success: boolean;
}

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(USER_TOKEN_REPOSITORY_TOKEN)
    private readonly userTokenRepository: UserTokenRepositoryInterface,
  ) {}

  async execute(request: LogoutRequest): Promise<LogoutResponse> {
    try {
      // 1. Parse user ID
      const userId = UserId.fromString(request.userId);

      // 2. Delete all tokens for this user
      await this.userTokenRepository.deleteByUserId(userId);

      // 3. Optional: Clean up expired tokens for all users
      await this.userTokenRepository.deleteExpiredTokens();

      return {
        message: 'Successfully logged out',
        success: true,
      };
    } catch {
      throw new Error('Failed to logout user');
    }
  }
}
