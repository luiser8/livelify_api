/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  USER_REPOSITORY_TOKEN,
  USER_RECOVERY_REPOSITORY_TOKEN,
  USER_TOKEN_REPOSITORY_TOKEN,
} from '../../ports/tokens';
import type { UserRepositoryInterface } from '../../../domain/repositories/user/user.repository.interface';
import type { UserRecoveryRepositoryInterface } from '../../../domain/repositories/user/user-recovery.repository.interface';
import { Password } from '../../../domain/value-objects/user/password.value-object';
import { RecoveryType } from '../../../domain/entities/user/user-recovery.entity';
import { SendGridEmailAdapter } from '../../../infrastructure/adapters/email/sendgrid-email.adapter';
import * as bcrypt from 'bcrypt';
import type { UserTokenRepositoryInterface } from 'src/domain/repositories/user/user-token.repository.interface';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(USER_RECOVERY_REPOSITORY_TOKEN)
    private readonly userRecoveryRepository: UserRecoveryRepositoryInterface,
    private readonly configService: ConfigService,
    private readonly emailAdapter: SendGridEmailAdapter,
    @Inject(USER_TOKEN_REPOSITORY_TOKEN)
    private readonly userTokenRepository: UserTokenRepositoryInterface,
  ) {}

  async execute(
    hash: string,
    newPassword: string,
    language?: 'es' | 'en',
  ): Promise<void> {
    // Buscar el registro de recuperación por hash
    const recovery = await this.userRecoveryRepository.findByHashAndType(
      hash,
      RecoveryType.RECOVER_PASSWORD,
    );

    if (!recovery || !recovery.active) {
      throw new BadRequestException('Invalid or expired recovery link');
    }

    // Verificar que el enlace no haya expirado
    const expirationTime = this.configService.get<string>(
      'APP_PASSWORD_RECOVERY_EXPIRE',
      '1h',
    );
    const expirationMs = this.parseTimeToMilliseconds(expirationTime);
    const createdAt = recovery.createdAt.getTime();
    const now = Date.now();
    const hasExpired = now - createdAt > expirationMs;

    if (hasExpired) {
      // Desactivar el recovery
      await this.userRecoveryRepository.deactivate(recovery.id);
      throw new BadRequestException('Recovery link has expired');
    }

    // Buscar usuario
    const user = await this.userRepository.findById(recovery.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validar y hashear la nueva contraseña
    const passwordVO = new Password(newPassword, false);
    const hashedPassword = await bcrypt.hash(passwordVO.getValue(), 10);

    // Actualizar la contraseña del usuario
    await this.userRepository.updatePassword(user.id, hashedPassword);

    // Desactivar el registro de recuperación
    await this.userRecoveryRepository.deactivate(recovery.id);

    // Enviar email de confirmación
    try {
      await this.emailAdapter.sendPasswordChangedEmail(
        user.email.getValue(),
        user.profile?.firstName || 'Usuario',
        language || 'es',
      );
    } catch (error) {
      console.error('Error sending password changed email:', error);
      // No lanzar error, ya que la contraseña fue cambiada exitosamente
    }

    // Opcional: Desactivar todos los tokens de sesión del usuario por seguridad
    await this.userTokenRepository.deleteByUserId(user.id);
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
