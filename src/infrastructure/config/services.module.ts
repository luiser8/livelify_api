import { Module } from '@nestjs/common';
import { EmailAdapter } from '../adapters/email/email.adapter';
import { PdfGeneratorAdapter } from '../adapters/pdf-generator/pdf-generator.adapter';
import { DiagnosticRepository } from '../repositories/diagnostic/diagnostic.repository';
import { DatabaseModule } from './database.module';
import { EMAIL_SERVICE_TOKEN } from '../../application/ports/email';
import { PDF_GENERATOR_SERVICE_TOKEN } from '../../application/ports/pdf-generator';
import { DIAGNOSTIC_REPOSITORY_TOKEN } from '../../application/ports/diagnostic-repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: EMAIL_SERVICE_TOKEN,
      useClass: EmailAdapter,
    },
    {
      provide: PDF_GENERATOR_SERVICE_TOKEN,
      useClass: PdfGeneratorAdapter,
    },
    {
      provide: DIAGNOSTIC_REPOSITORY_TOKEN,
      useClass: DiagnosticRepository,
    },
  ],
  exports: [
    EMAIL_SERVICE_TOKEN,
    PDF_GENERATOR_SERVICE_TOKEN,
    DIAGNOSTIC_REPOSITORY_TOKEN,
  ],
})
export class ServicesModule {}
