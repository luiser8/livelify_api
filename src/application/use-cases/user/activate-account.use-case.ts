import { Injectable, Inject } from '@nestjs/common';
import type { UserRecoveryRepositoryInterface } from '../../../domain/repositories/user/user-recovery.repository.interface';
import { USER_RECOVERY_REPOSITORY_TOKEN } from '../../ports/tokens';
import { RecoveryType } from '../../../domain/entities/user/user-recovery.entity';

export interface ActivateAccountRequest {
  hash: string;
}

export interface ActivateAccountResponse {
  success: boolean;
  message: string;
}

@Injectable()
export class ActivateAccountUseCase {
  constructor(
    @Inject(USER_RECOVERY_REPOSITORY_TOKEN)
    private readonly userRecoveryRepository: UserRecoveryRepositoryInterface,
  ) {}

  async execute(
    request: ActivateAccountRequest,
  ): Promise<ActivateAccountResponse> {
    // 1. Find the recovery record by hash
    const userRecovery = await this.userRecoveryRepository.findByUrlHash(
      request.hash,
      RecoveryType.REGISTER,
    );

    if (userRecovery === null) {
      throw new Error('Invalid activation link');
    }

    // 2. Check if it's still active
    if (!userRecovery.active) {
      throw new Error("This user's activation link has already been processed");
    }

    // 3. Deactivate the recovery record (mark as used)
    userRecovery.deactivate();
    await this.userRecoveryRepository.update(userRecovery);

    // 5. Return success response
    return {
      success: true,
      message: 'Account activated successfully',
    };
  }
}
