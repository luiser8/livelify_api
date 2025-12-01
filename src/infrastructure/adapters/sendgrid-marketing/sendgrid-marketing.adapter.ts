/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sendgridClient from '@sendgrid/client';
import {
  SendGridMarketingServiceInterface,
  AddContactToListRequest,
  AddContactToListResponse,
} from '../../../application/ports/sendgrid-marketing';

@Injectable()
export class SendGridMarketingAdapter implements SendGridMarketingServiceInterface {
  private readonly apiKey: string;
  private readonly listId: string;
  private readonly listContactsId: string;

  constructor(private readonly configService: ConfigService) {
    // Get API Key from environment
    this.apiKey = this.configService.get<string>('SENDGRID_API_KEY', '');

    // Get List ID from environment
    this.listId = this.configService.get<string>('SENDGRID_LIST_ID', '');

    // Get List Contacts ID from environment
    this.listContactsId = this.configService.get<string>(
      'SENDGRID_LIST_CONTACTS_ID',
      '',
    );

    // Configure SendGrid client with API key
    if (this.apiKey) {
      sendgridClient.setApiKey(this.apiKey);
    }
  }

  async addContactToList(
    request: AddContactToListRequest,
  ): Promise<AddContactToListResponse> {
    // Check if SendGrid is configured
    if (!this.apiKey || !this.listId) {
      console.warn('⚠️ SendGrid not configured. Skipping contact addition.', {
        hasApiKey: !!this.apiKey,
        hasListId: !!this.listId,
      });
      return { success: false, error: 'SendGrid not configured' };
    }

    try {
      // Prepare data structure for SendGrid API
      const data = {
        list_ids: [
          request.listIdType === 'diagnostic'
            ? this.listId
            : this.listContactsId,
        ],
        contacts: [
          {
            email: request.email,
            custom_fields: {
              ...(request.customFields.nombre_cliente && {
                nombre_cliente: request.customFields.nombre_cliente,
              }),
              ...(request.customFields.puntuacion_promedio && {
                puntuacion_promedio: request.customFields.puntuacion_promedio,
              }),
              ...(request.customFields.score_desarrollo !== undefined && {
                score_desarrollo: request.customFields.score_desarrollo,
              }),
              ...(request.customFields.score_profesional !== undefined && {
                score_profesional: request.customFields.score_profesional,
              }),
              ...(request.customFields.score_salud !== undefined && {
                score_salud: request.customFields.score_salud,
              }),
              ...(request.customFields.score_finanzas !== undefined && {
                score_finanzas: request.customFields.score_finanzas,
              }),
              ...(request.customFields.score_familia !== undefined && {
                score_familia: request.customFields.score_familia,
              }),
              ...(request.customFields.score_amor !== undefined && {
                score_amor: request.customFields.score_amor,
              }),
            },
          },
        ],
      };

      // Make API call to SendGrid
      const requestConfig = {
        url: '/v3/marketing/contacts',
        method: 'PUT' as const,
        body: data,
      };

      const [response] = await sendgridClient.request(requestConfig);

      // Check if request was successful (202 Accepted)
      if (response.statusCode === 202) {
        console.log(
          `✅ Contact ${request.email} successfully added to SendGrid list.`,
        );
        return { success: true };
      } else {
        console.error('❌ Error adding contact to SendGrid:', response);
        return { success: false, error: response };
      }
    } catch (error) {
      console.error(
        '❌ Error connecting to SendGrid API:',
        error.message || error,
      );
      return { success: false, error };
    }
  }
}
