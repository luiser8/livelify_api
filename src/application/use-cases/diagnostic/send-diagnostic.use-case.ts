/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Inject, Injectable } from '@nestjs/common';
import { SENDGRID_MARKETING_SERVICE_TOKEN } from '../../ports/sendgrid-marketing';
import type { SendGridMarketingServiceInterface } from '../../ports/sendgrid-marketing';
import { SendGridEmailAdapter } from '../../../infrastructure/adapters/email/sendgrid-email.adapter';

export interface SendDiagnosticRequest {
  name: string;
  email: string;
  scores: {
    personal: number;
    professional: number;
    health: number;
    finances: number;
    family: number;
    love: number;
  };
  average: number;
}

export interface SendDiagnosticResponse {
  success: boolean;
  message: string;
  addedToSendGrid: boolean;
  emailSent: boolean;
}

@Injectable()
export class SendDiagnosticUseCase {
  constructor(
    @Inject(SENDGRID_MARKETING_SERVICE_TOKEN)
    private readonly sendGridMarketing: SendGridMarketingServiceInterface,
    private readonly sendGridEmail: SendGridEmailAdapter,
  ) {}

  async execute(
    request: SendDiagnosticRequest,
  ): Promise<SendDiagnosticResponse> {
    try {
      // 1. Add contact to SendGrid marketing list
      let addedToSendGrid = false;
      try {
        const sendGridResult = await this.sendGridMarketing.addContactToList({
          email: request.email,
          listIdType: 'diagnostic',
          customFields: {
            nombre_cliente: request.name,
            puntuacion_promedio: request.average.toFixed(1),
            score_desarrollo: request.scores.personal,
            score_profesional: request.scores.professional,
            score_salud: request.scores.health,
            score_finanzas: request.scores.finances,
            score_familia: request.scores.family,
            score_amor: request.scores.love,
          },
        });

        addedToSendGrid = sendGridResult.success;

        if (!sendGridResult.success) {
          console.warn(
            '⚠️ Failed to add contact to SendGrid:',
            sendGridResult.error,
          );
        }
      } catch (sendGridError) {
        console.error(
          '❌ SendGrid error (non-blocking):',
          sendGridError.message,
        );
      }

      // 2. Send email via SendGrid with Dynamic Template
      let emailSent = false;
      try {
        await this.sendGridEmail.sendEmail(request.email, 'diagnostic', {
          nombre_cliente: request.name,
          puntuacion_promedio: request.average.toFixed(1),
          score_desarrollo: request.scores.personal,
          score_profesional: request.scores.professional,
          score_salud: request.scores.health,
          score_finanzas: request.scores.finances,
          score_familia: request.scores.family,
          score_amor: request.scores.love,
        });
        emailSent = true;
      } catch (emailError) {
        console.error('❌ Email error (non-blocking):', emailError.message);
      }

      return {
        success: true,
        message: 'Contact added to SendGrid and email sent successfully',
        addedToSendGrid,
        emailSent,
      };
    } catch (error) {
      throw new Error(`Failed to process diagnostic: ${error.message}`);
    }
  }
}
