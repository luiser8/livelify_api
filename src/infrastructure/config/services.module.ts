import { Module } from '@nestjs/common';
import { SendGridEmailAdapter } from '../adapters/email/sendgrid-email.adapter';
import { SendGridMarketingAdapter } from '../adapters/sendgrid-marketing/sendgrid-marketing.adapter';
import { DiagnosticRepository } from '../repositories/diagnostic/diagnostic.repository';
import { DatabaseModule } from './database.module';
import { EMAIL_SERVICE_TOKEN } from '../../application/ports/email';
import { SENDGRID_MARKETING_SERVICE_TOKEN } from '../../application/ports/sendgrid-marketing';
import { DIAGNOSTIC_REPOSITORY_TOKEN } from '../../application/ports/diagnostic-repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: EMAIL_SERVICE_TOKEN,
      useClass: SendGridEmailAdapter,
    },
    {
      provide: SENDGRID_MARKETING_SERVICE_TOKEN,
      useClass: SendGridMarketingAdapter,
    },
    {
      provide: DIAGNOSTIC_REPOSITORY_TOKEN,
      useClass: DiagnosticRepository,
    },
  ],
  exports: [
    EMAIL_SERVICE_TOKEN,
    SENDGRID_MARKETING_SERVICE_TOKEN,
    DIAGNOSTIC_REPOSITORY_TOKEN,
  ],
})
export class ServicesModule {}
