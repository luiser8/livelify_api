/**
 * SendGrid Marketing Service Port
 * Interface for adding contacts to SendGrid marketing lists
 */

export const SENDGRID_MARKETING_SERVICE_TOKEN = Symbol(
  'SENDGRID_MARKETING_SERVICE',
);

export interface AddContactToListRequest {
  email: string;
  customFields: {
    nombre_cliente?: string;
    puntuacion_promedio?: string;
    score_desarrollo?: number;
    score_profesional?: number;
    score_salud?: number;
    score_finanzas?: number;
    score_familia?: number;
    score_amor?: number;
  };
}

export interface AddContactToListResponse {
  success: boolean;
  error?: any;
}

export interface SendGridMarketingServiceInterface {
  addContactToList(
    request: AddContactToListRequest,
  ): Promise<AddContactToListResponse>;
}
