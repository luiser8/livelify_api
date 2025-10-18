/**
 * Email Service Port
 * Interface for sending emails with attachments
 */

export const EMAIL_SERVICE_TOKEN = Symbol('EMAIL_SERVICE');

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

export interface SendEmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
}

export interface EmailServiceInterface {
  sendEmail(request: SendEmailRequest): Promise<void>;
}
