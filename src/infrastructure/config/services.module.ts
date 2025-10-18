import { Module } from '@nestjs/common';
import { SendGridMarketingAdapter } from '../adapters/sendgrid-marketing/sendgrid-marketing.adapter';
import { SENDGRID_MARKETING_SERVICE_TOKEN } from '../../application/ports/sendgrid-marketing';

@Module({
  imports: [],
  providers: [
    {
      provide: SENDGRID_MARKETING_SERVICE_TOKEN,
      useClass: SendGridMarketingAdapter,
    },
  ],
  exports: [SENDGRID_MARKETING_SERVICE_TOKEN],
})
export class ServicesModule {}
