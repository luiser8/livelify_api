/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Inject, Injectable } from '@nestjs/common';
import { EMAIL_SERVICE_TOKEN } from '../../ports/email';
import type { EmailServiceInterface } from '../../ports/email';
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
    @Inject(EMAIL_SERVICE_TOKEN)
    private readonly emailService: EmailServiceInterface,
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

      // 2. Send email via SendGrid
      const emailHtml = this.generateEmailHtml(request);

      await this.emailService.sendEmail({
        to: request.email,
        subject: 'Tu Diagnóstico de la Rueda de la Vida - Livelify',
        html: emailHtml,
        text: `Hola ${request.name},\n\nGracias por completar tu diagnóstico de la Rueda de la Vida. Tu puntuación promedio es ${request.average}/10.\n\nSaludos,\nEquipo Livelify`,
      });

      console.log('✅ Email sent to:', request.email);

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

  private generateEmailHtml(request: SendDiagnosticRequest): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #2563eb;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #f9fafb;
              padding: 30px;
              border-radius: 0 0 5px 5px;
            }
            .score {
              background-color: white;
              padding: 15px;
              margin: 15px 0;
              border-radius: 5px;
              border-left: 4px solid #2563eb;
            }
            .score-label {
              font-weight: bold;
              color: #2563eb;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #6b7280;
              font-size: 12px;
            }
            .average {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
              text-align: center;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>¡Tu Diagnóstico está Listo!</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${request.name}</strong>,</p>
            <p>Gracias por completar tu diagnóstico de la Rueda de la Vida con Livelify.</p>
            
            <div class="average">
              Tu puntuación promedio: ${request.average.toFixed(1)}/10
            </div>

            <h3>Tus Puntuaciones:</h3>
            <div class="score">
              <span class="score-label">Personal:</span> ${request.scores.personal}/10
            </div>
            <div class="score">
              <span class="score-label">Profesional:</span> ${request.scores.professional}/10
            </div>
            <div class="score">
              <span class="score-label">Salud:</span> ${request.scores.health}/10
            </div>
            <div class="score">
              <span class="score-label">Finanzas:</span> ${request.scores.finances}/10
            </div>
            <div class="score">
              <span class="score-label">Familia:</span> ${request.scores.family}/10
            </div>
            <div class="score">
              <span class="score-label">Amor:</span> ${request.scores.love}/10
            </div>

            <p style="margin-top: 30px;">
              Revisa tus resultados arriba y descubre cómo mejorar cada área de tu vida.
            </p>
            
            <p>
              <strong>¿Qué sigue?</strong><br>
              Únete a Livelify para comenzar a mejorar cada área de tu vida con nuestro coaching personalizado.
            </p>

          </div>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Livelify. Todos los derechos reservados.</p>
          </div>
        </body>
      </html>
    `;
  }
}
