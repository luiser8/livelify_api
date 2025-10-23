/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

@Injectable()
export class SendGridEmailAdapter {
  private readonly apiKey: string;
  private readonly fromEmail: string;
  private readonly templateId: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('SENDGRID_API_KEY', '');
    this.fromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL', '');
    this.templateId = this.configService.get<string>(
      'SENDGRID_TEMPLATE_ID',
      '',
    );

    if (this.apiKey) {
      sgMail.setApiKey(this.apiKey);
    }
  }

  async sendEmail(
    to: string,
    dynamicTemplateData: Record<string, any>,
  ): Promise<void> {
    if (!this.apiKey || !this.templateId) {
      console.warn('⚠️ SendGrid not configured. Skipping email.');
      return;
    }

    try {
      const msg = {
        to,
        from: this.fromEmail,
        templateId: this.templateId,
        dynamicTemplateData,
      };

      await sgMail.send(msg);
    } catch (error) {
      console.error('❌ SendGrid email error:', error);
      throw new Error(
        `Failed to send email: ${error.message || 'Unknown error'}`,
      );
    }
  }
}
