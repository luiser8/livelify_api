/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY_TOKEN,
  USER_RECOVERY_REPOSITORY_TOKEN,
} from '../../ports/tokens';
import type { UserRepositoryInterface } from '../../../domain/repositories/user/user.repository.interface';
import type { UserRecoveryRepositoryInterface } from '../../../domain/repositories/user/user-recovery.repository.interface';
import { SendGridEmailAdapter } from '../../../infrastructure/adapters/email/sendgrid-email.adapter';
import { UserRecovery } from '../../../domain/entities/user/user-recovery.entity';
import { Email } from '../../../domain/value-objects/user/email.value-object';
import { type Language } from '../../../infrastructure/adapters/email/email-templates';

@Injectable()
export class RequestPasswordRecoveryUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(USER_RECOVERY_REPOSITORY_TOKEN)
    private readonly userRecoveryRepository: UserRecoveryRepositoryInterface,
    private readonly emailAdapter: SendGridEmailAdapter,
  ) {}

  async execute(email: string, language: Language = 'es'): Promise<void> {
    // Buscar usuario por email
    const emailVO = new Email(email);
    const user = await this.userRepository.findByEmail(emailVO);

    if (!user) {
      // Por seguridad, no revelar si el email existe o no
      // Retornar exitosamente sin enviar email
      return;
    }

    // Generar hash de recuperación
    const recoveryHash = UserRecovery.generateActivationHash();

    // Crear registro de recuperación
    const recovery = UserRecovery.createForPasswordRecovery(user.id);

    // Guardar el recovery con el hash
    await this.userRecoveryRepository.create({
      ...recovery.toPlainObject(),
      urlHash: recoveryHash,
    });

    // Enviar email de recuperación
    try {
      await this.emailAdapter.sendPasswordRecoveryEmail(
        user.email.getValue(),
        recoveryHash,
        user.profile?.firstName || 'Usuario',
        language,
      );
    } catch (error) {
      console.error('Error sending password recovery email:', error);
      // No lanzar error para no revelar si el usuario existe
    }
  }
}
