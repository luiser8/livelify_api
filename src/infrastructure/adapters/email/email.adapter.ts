import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import {
  EmailServiceInterface,
  SendEmailRequest,
} from '../../../application/ports/email';

@Injectable()
export class EmailAdapter implements EmailServiceInterface {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const smtpPort = parseInt(
      this.configService.get<string>('SMTP_PORT', '587'),
    );
    const smtpSecure =
      this.configService.get<string>('SMTP_SECURE', 'false') === 'true';

    // Configure nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: smtpPort,
      secure: smtpSecure, // true for 465, false for other ports
      requireTLS: !smtpSecure, // Use STARTTLS for non-secure connections
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
      tls: {
        // Don't fail on invalid certs (for development)
        rejectUnauthorized:
          this.configService.get<string>('APP_ENV') === 'production',
      },
    });
  }

  async sendEmail(request: SendEmailRequest): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: this.configService.get<string>('SMTP_FROM'),
      to: request.to,
      subject: request.subject,
      html: request.html,
      text: request.text,
      attachments: request.attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
    } catch (error) {
      console.error('Email sending error:', error);
      throw new Error(
        `Failed to send email: ${error.message || 'Unknown error'}`,
      );
    }
  }
}
