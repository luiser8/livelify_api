import { Module } from '@nestjs/common';
import { SendGridEmailAdapter } from '../adapters/email/sendgrid-email.adapter';
import { SendGridMarketingAdapter } from '../adapters/sendgrid-marketing/sendgrid-marketing.adapter';
import { SENDGRID_MARKETING_SERVICE_TOKEN } from '../../application/ports/sendgrid-marketing';

@Module({
  imports: [],
  providers: [
    SendGridEmailAdapter,
    {
      provide: SENDGRID_MARKETING_SERVICE_TOKEN,
      useClass: SendGridMarketingAdapter,
    },
  ],
  exports: [SendGridEmailAdapter, SENDGRID_MARKETING_SERVICE_TOKEN],
})
export class ServicesModule {}
