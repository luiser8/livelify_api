import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

// Guards and Decorators
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PublicThrottle } from '../decorators/throttle.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';

// DTOs
import {
  SubmitAreaAnswersDto,
  SubmitAreaAnswersResponseDto,
} from '../dtos/answer/submit-area-answers.dto';

// Use Cases
import { SubmitAreaAnswersUseCase } from '../../application/use-cases/answer/submit-area-answers.use-case';

@ApiTags('Answers')
@Controller('answers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AnswerController {
  constructor(
    private readonly submitAreaAnswersUseCase: SubmitAreaAnswersUseCase,
  ) {}

  @Post('submit-area')
  @PublicThrottle() // 100 requests per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit answers for questions in a specific life area',
    description:
      'Submit up to 10 answers for questions in a specific life area. Calculates area score and updates global LifeWheel score.',
  })
  @ApiResponse({
    status: 200,
    description: 'Answers submitted successfully with updated scores',
    type: SubmitAreaAnswersResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or invalid questions',
  })
  @ApiResponse({
    status: 404,
    description: 'Area not found or user has no LifeWheel',
  })
  async submitAreaAnswers(
    @Body() submitAreaAnswersDto: SubmitAreaAnswersDto,
    @CurrentUser() user: { sub: string },
  ): Promise<SubmitAreaAnswersResponseDto> {
    try {
      const result = await this.submitAreaAnswersUseCase.execute({
        userId: user.sub,
        areaId: submitAreaAnswersDto.areaId,
        answers: submitAreaAnswersDto.answers,
      });

      return result;
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes('not found') ||
          error.message.includes('No LifeWheel')
        ) {
          throw new NotFoundException(error.message);
        }
        if (
          error.message.includes('do not belong') ||
          error.message.includes('No questions')
        ) {
          throw new BadRequestException(error.message);
        }
      }
      throw error;
    }
  }
}
