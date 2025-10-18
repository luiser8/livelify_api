/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sendgridMail from '@sendgrid/mail';
import {
  EmailServiceInterface,
  SendEmailRequest,
} from '../../../application/ports/email';

@Injectable()
export class SendGridEmailAdapter implements EmailServiceInterface {
  private readonly apiKey: string;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    // Get API Key from environment
    this.apiKey = this.configService.get<string>('SENDGRID_API_KEY', '');

    // Get from email (must be verified in SendGrid)
    this.fromEmail = this.configService.get<string>(
      'SENDGRID_FROM_EMAIL',
      'noreply@flowpartners.cl',
    );

    // Configure SendGrid with API key
    if (this.apiKey) {
      sendgridMail.setApiKey(this.apiKey);
    }
  }

  async sendEmail(request: SendEmailRequest): Promise<void> {
    // Check if SendGrid is configured
    if (!this.apiKey) {
      console.warn('⚠️ SendGrid API Key not configured. Skipping email.');
      throw new Error('SendGrid not configured');
    }

    try {
      // Prepare attachments for SendGrid format if any
      const attachments = request.attachments?.map((attachment) => ({
        content: attachment.content.toString('base64'),
        filename: attachment.filename,
        type: attachment.contentType,
        disposition: 'attachment',
      }));

      // Send email using SendGrid
      await sendgridMail.send({
        to: request.to,
        from: this.fromEmail,
        subject: request.subject,
        html: request.html,
        text: request.text,
        attachments,
      });

      console.log('✅ Email sent successfully via SendGrid to:', request.to);
    } catch (error) {
      console.error('❌ SendGrid email error:', error);
      throw new Error(
        `Failed to send email: ${error.message || 'Unknown error'}`,
      );
    }
  }
}
