import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../decorators/public.decorator';
import { PublicThrottle } from '../decorators/throttle.decorator';
import { SendDiagnosticDto } from '../dtos/diagnostic';
import { SendDiagnosticUseCase } from '../../application/use-cases/diagnostic/send-diagnostic.use-case';
import { ApiKeyGuard } from '../guards/api-key.guard';

@ApiTags('Diagnostic')
@Controller('diagnostic')
export class DiagnosticController {
  constructor(private readonly sendDiagnosticUseCase: SendDiagnosticUseCase) {}

  @Post('send')
  @Public()
  @PublicThrottle()
  @UseGuards(ApiKeyGuard)
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: 'X-Api-Key',
    description: 'API key for diagnostic endpoint',
    required: true,
  })
  @ApiOperation({
    summary: 'Send diagnostic report via email',
    description:
      'Public endpoint to receive diagnostic data from sales website, generate PDF and send it via email',
  })
  @ApiResponse({
    status: 200,
    description: 'Diagnostic sent successfully',
    schema: {
      example: {
        success: true,
        message: 'Diagnostic saved and email sent successfully',
        diagnosticId: '123e4567-e89b-12d3-a456-426614174000',
        emailSent: true,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async sendDiagnostic(@Body() dto: SendDiagnosticDto) {
    return await this.sendDiagnosticUseCase.execute({
      name: dto.name,
      email: dto.email,
      scores: dto.scores,
      average: dto.average,
    });
  }
}
