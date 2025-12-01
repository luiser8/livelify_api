/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';
import {
  generateActivationEmailHtml,
  generatePasswordRecoveryEmailHtml,
  generatePasswordChangedEmailHtml,
  type Language,
} from './email-templates';

@Injectable()
export class SendGridEmailAdapter {
  private readonly apiKey: string;
  private readonly fromEmail: string;
  private readonly templateId: string;
  private readonly templateContactsId: string;
  private readonly activationTemplateId: string;
  private readonly passwordRecoveryTemplateId: string;
  private readonly frontendUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('SENDGRID_API_KEY', '');
    this.fromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL', '');
    this.templateId = this.configService.get<string>(
      'SENDGRID_TEMPLATE_ID',
      '',
    );
    this.templateContactsId = this.configService.get<string>(
      'SENDGRID_TEMPLATE_CONTACTS_ID',
      '',
    );
    this.activationTemplateId = this.configService.get<string>(
      'SENDGRID_ACTIVATION_TEMPLATE_ID',
      '',
    );
    this.passwordRecoveryTemplateId = this.configService.get<string>(
      'SENDGRID_PASSWORD_RECOVERY_TEMPLATE_ID',
      '',
    );
    this.frontendUrl = this.configService.get<string>(
      'SENDGRID_FRONTEND_URL',
      '',
    );

    if (this.apiKey) {
      sgMail.setApiKey(this.apiKey);
    }
  }

  async sendEmail(
    to: string,
    type: 'diagnostic' | 'contacts',
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
        templateId:
          type === 'diagnostic' ? this.templateId : this.templateContactsId,
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

  /**
   * Sends account activation email with activation link
   * @param to - Email address to send to
   * @param activationHash - Hash to include in activation URL
   * @param firstName - User's first name for personalization
   * @param language - Language for the email (es or en), defaults to es
   */
  async sendActivationEmail(
    to: string,
    activationHash: string,
    firstName: string,
    language: Language = 'es',
  ): Promise<void> {
    if (!this.apiKey) {
      console.warn('⚠️ SendGrid not configured. Skipping activation email.');
      return;
    }

    try {
      const activationUrl = `${this.frontendUrl}/activate-account?hash=${activationHash}`;

      // Si hay template de activación configurado, usarlo
      if (this.activationTemplateId) {
        const msg = {
          to,
          from: this.fromEmail,
          templateId: this.activationTemplateId,
          dynamicTemplateData: {
            firstName,
            activationUrl,
            language,
          },
        };
        await sgMail.send(msg);
      } else {
        // Fallback: enviar email con template generado
        const emailContent = generateActivationEmailHtml(
          firstName,
          activationUrl,
          language,
        );

        const msg = {
          to,
          from: this.fromEmail,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        };
        await sgMail.send(msg);
      }

      console.log(`✅ Activation email sent to ${to} in ${language}`);
    } catch (error) {
      console.error('❌ SendGrid activation email error:', error);
      throw new Error(
        `Failed to send activation email: ${error.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Sends password recovery email with recovery link
   * @param to - Email address to send to
   * @param recoveryHash - Hash to include in recovery URL
   * @param firstName - User's first name for personalization
   * @param language - Language for the email (es or en), defaults to es
   */
  async sendPasswordRecoveryEmail(
    to: string,
    recoveryHash: string,
    firstName: string,
    language: Language = 'es',
  ): Promise<void> {
    if (!this.apiKey) {
      console.warn(
        '⚠️ SendGrid not configured. Skipping password recovery email.',
      );
      return;
    }

    try {
      const recoveryUrl = `${this.frontendUrl}/reset-password?hash=${recoveryHash}`;

      // Si hay template de recuperación configurado, usarlo
      if (this.passwordRecoveryTemplateId) {
        const msg = {
          to,
          from: this.fromEmail,
          templateId: this.passwordRecoveryTemplateId,
          dynamicTemplateData: {
            firstName,
            recoveryUrl,
            language,
          },
        };
        await sgMail.send(msg);
      } else {
        // Fallback: enviar email con template generado
        const emailContent = generatePasswordRecoveryEmailHtml(
          firstName,
          recoveryUrl,
          language,
        );

        const msg = {
          to,
          from: this.fromEmail,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        };
        await sgMail.send(msg);
      }
    } catch (error) {
      console.error('❌ SendGrid password recovery email error:', error);
      throw new Error(
        `Failed to send password recovery email: ${error.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Sends password changed confirmation email
   * @param to - Email address to send to
   * @param firstName - User's first name for personalization
   * @param language - Language for the email (es or en), defaults to es
   */
  async sendPasswordChangedEmail(
    to: string,
    firstName: string,
    language: Language = 'es',
  ): Promise<void> {
    if (!this.apiKey) {
      console.warn(
        '⚠️ SendGrid not configured. Skipping password changed email.',
      );
      return;
    }

    try {
      const loginUrl = `${this.frontendUrl}/login`;

      // Generar email con template
      const emailContent = generatePasswordChangedEmailHtml(
        firstName,
        loginUrl,
        language,
      );

      const msg = {
        to,
        from: this.fromEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      };
      await sgMail.send(msg);

      console.log(`✅ Password changed email sent to ${to} in ${language}`);
    } catch (error) {
      console.error('❌ SendGrid password changed email error:', error);
      throw new Error(
        `Failed to send password changed email: ${error.message || 'Unknown error'}`,
      );
    }
  }
}
