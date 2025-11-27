import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { USER_RECOVERY_REPOSITORY_TOKEN } from '../../ports/tokens';
import type { UserRecoveryRepositoryInterface } from '../../../domain/repositories/user/user-recovery.repository.interface';
import { RecoveryType } from '../../../domain/entities/user/user-recovery.entity';

export interface VerifyPasswordRecoveryResponse {
  valid: boolean;
  message: string;
  alreadyProcessed?: boolean;
  expired?: boolean;
}

@Injectable()
export class VerifyPasswordRecoveryUseCase {
  constructor(
    @Inject(USER_RECOVERY_REPOSITORY_TOKEN)
    private readonly userRecoveryRepository: UserRecoveryRepositoryInterface,
    private readonly configService: ConfigService,
  ) {}

  async execute(hash: string): Promise<VerifyPasswordRecoveryResponse> {
    // Buscar el registro de recuperación por hash
    const recovery = await this.userRecoveryRepository.findByHashAndType(
      hash,
      RecoveryType.RECOVER_PASSWORD,
    );

    // Si no existe el recovery
    if (!recovery) {
      throw new NotFoundException('Recovery link not found');
    }

    // Si ya fue procesado (active = false)
    if (!recovery.active) {
      return {
        valid: false,
        message: 'This recovery link has already been used',
        alreadyProcessed: true,
      };
    }

    // Verificar si ha expirado
    const expirationTime = this.configService.get<string>(
      'APP_PASSWORD_RECOVERY_EXPIRE',
      '1h',
    );
    const expirationMs = this.parseTimeToMilliseconds(expirationTime);
    const createdAt = recovery.createdAt.getTime();
    const now = Date.now();
    const hasExpired = now - createdAt > expirationMs;

    if (hasExpired) {
      // Desactivar el recovery si ha expirado
      await this.userRecoveryRepository.deactivate(recovery.id);

      return {
        valid: false,
        message: 'This recovery link has expired',
        expired: true,
      };
    }

    // El hash es válido y activo
    return {
      valid: true,
      message: 'Recovery link is valid',
    };
  }

  /**
   * Parse time string to milliseconds
   * Supports formats: 1h, 24h, 1d, 30m
   */
  private parseTimeToMilliseconds(timeString: string): number {
    const match = timeString.match(/^(\d+)([hdm])$/);
    if (!match) {
      // Default to 1 hour if format is not recognized
      return 60 * 60 * 1000;
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 'h':
        return value * 60 * 60 * 1000; // hours to milliseconds
      case 'd':
        return value * 24 * 60 * 60 * 1000; // days to milliseconds
      case 'm':
        return value * 60 * 1000; // minutes to milliseconds
      default:
        return 60 * 60 * 1000; // default 1 hour
    }
  }
}
