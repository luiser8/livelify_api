/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Inject, Injectable } from '@nestjs/common';
import { SENDGRID_MARKETING_SERVICE_TOKEN } from '../../ports/sendgrid-marketing';
import type { SendGridMarketingServiceInterface } from '../../ports/sendgrid-marketing';

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

        if (sendGridResult.success) {
          console.log('✅ Contact added to SendGrid marketing list');
        } else {
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

      return {
        success: true,
        message: 'Diagnostic saved and email sent successfully',
        addedToSendGrid,
        emailSent: true,
      };
    } catch (error) {
      throw new Error(`Failed to process diagnostic: ${error.message}`);
    }
  }
}
