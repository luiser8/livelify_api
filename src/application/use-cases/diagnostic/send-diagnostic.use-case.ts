/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EMAIL_SERVICE_TOKEN } from '../../ports/email';
import type { EmailServiceInterface } from '../../ports/email';
import { PDF_GENERATOR_SERVICE_TOKEN } from '../../ports/pdf-generator';
import type { PdfGeneratorServiceInterface } from '../../ports/pdf-generator';
import { DIAGNOSTIC_REPOSITORY_TOKEN } from '../../ports/diagnostic-repository';
import type { DiagnosticRepositoryInterface } from '../../ports/diagnostic-repository';
import { Diagnostic } from '../../../domain/entities/diagnostic.entity';

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
  diagnosticId: string;
  emailSent?: boolean;
}

@Injectable()
export class SendDiagnosticUseCase {
  constructor(
    @Inject(EMAIL_SERVICE_TOKEN)
    private readonly emailService: EmailServiceInterface,
    @Inject(PDF_GENERATOR_SERVICE_TOKEN)
    private readonly pdfGenerator: PdfGeneratorServiceInterface,
    @Inject(DIAGNOSTIC_REPOSITORY_TOKEN)
    private readonly diagnosticRepository: DiagnosticRepositoryInterface,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    request: SendDiagnosticRequest,
  ): Promise<SendDiagnosticResponse> {
    try {
      // 1. Create and save diagnostic entity in PostgreSQL
      const diagnostic = Diagnostic.create(
        request.name,
        request.email,
        request.scores,
        request.average,
      );

      const savedDiagnostic = await this.diagnosticRepository.save(diagnostic);
      console.log('✅ Diagnostic saved in database:', savedDiagnostic.getId());

      // 2. Check if email sending is enabled
      const sendEmailEnabled =
        this.configService.get<string>('DIAGNOSTIC_SEND_EMAIL', 'true') ===
        'true';

      let emailSent = false;

      if (sendEmailEnabled) {
        // 3. Generate PDF from diagnostic data
        const pdfBuffer = await this.pdfGenerator.generateDiagnosticPdf({
          name: request.name,
          email: request.email,
          scores: request.scores,
          average: request.average,
        });

        // 4. Prepare email content
        const emailHtml = this.generateEmailHtml(request);

        // 5. Send email with PDF attachment
        await this.emailService.sendEmail({
          to: request.email,
          subject: 'Tu Diagnóstico de la Rueda de la Vida - Livelify',
          html: emailHtml,
          text: `Hola ${request.name},\n\nGracias por completar tu diagnóstico de la Rueda de la Vida. Tu puntuación promedio es ${request.average}/10.\n\nAdjunto encontrarás un PDF detallado con tus resultados.\n\nSaludos,\nEquipo Livelify`,
          attachments: [
            {
              filename: `diagnostico-rueda-vida-${Date.now()}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf',
            },
          ],
        });

        emailSent = true;
        console.log('✅ Email sent to:', request.email);
      } else {
        console.log(
          '⚠️ Email sending is disabled (DIAGNOSTIC_SEND_EMAIL=false)',
        );
      }

      return {
        success: true,
        message: emailSent
          ? 'Diagnostic saved and email sent successfully'
          : 'Diagnostic saved successfully (email disabled)',
        diagnosticId: savedDiagnostic.getId(),
        emailSent,
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
              Adjunto encontrarás un PDF detallado con tus resultados que puedes guardar o imprimir.
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
