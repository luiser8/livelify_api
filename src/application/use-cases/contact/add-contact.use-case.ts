/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Inject, Injectable } from '@nestjs/common';
import { SENDGRID_MARKETING_SERVICE_TOKEN } from '../../ports/sendgrid-marketing';
import type { SendGridMarketingServiceInterface } from '../../ports/sendgrid-marketing';
import { SendGridEmailAdapter } from 'src/infrastructure/adapters/email/sendgrid-email.adapter';

export interface AddContactRequest {
  name: string;
  email: string;
}

export interface AddContactResponse {
  success: boolean;
  message: string;
  addedToSendGrid: boolean;
}

@Injectable()
export class AddContactUseCase {
  constructor(
    @Inject(SENDGRID_MARKETING_SERVICE_TOKEN)
    private readonly sendGridMarketing: SendGridMarketingServiceInterface,
    private readonly sendGridEmail: SendGridEmailAdapter,
  ) {}

  async execute(request: AddContactRequest): Promise<AddContactResponse> {
    try {
      // Add contact to SendGrid marketing list
      let addedToSendGrid = false;
      try {
        const sendGridResult = await this.sendGridMarketing.addContactToList({
          email: request.email,
          listIdType: 'contacts',
          customFields: {
            nombre_cliente: request.name,
          },
        });

        addedToSendGrid = sendGridResult.success;

        if (!sendGridResult.success) {
          console.warn(
            '⚠️ Failed to add contact to SendGrid:',
            sendGridResult.error,
          );
          return {
            success: false,
            message: `Failed to add contact to SendGrid: ${sendGridResult.error}`,
            addedToSendGrid: false,
          };
        }

        // 2. Send email via SendGrid with Dynamic Template
        try {
          await this.sendGridEmail.sendEmail(request.email, 'contacts', {
            nombre_cliente: request.name,
            email: request.email,
          });
        } catch (emailError) {
          console.error('❌ Email error (non-blocking):', emailError.message);
        }
      } catch (sendGridError) {
        console.error('❌ SendGrid error:', sendGridError.message);
        throw new Error(
          `Failed to add contact to SendGrid: ${sendGridError.message}`,
        );
      }

      return {
        success: true,
        message: 'Contact added to SendGrid and email sent successfully',
        addedToSendGrid,
      };
    } catch (error) {
      throw new Error(`Failed to add contact: ${error.message}`);
    }
  }
}
