import {
  Controller,
  Get,
  UseGuards,
  NotFoundException,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

// Guards and Decorators
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { DefaultThrottle } from '../decorators/throttle.decorator';

// DTOs

// Use Cases
import { GetQuestionByAreaIdUseCase } from 'src/application/use-cases/question/get-by-area-questions.use-case';
import { AreaId } from 'src/domain/value-objects/area/area-id.value-object';
import { GetQuestionsByAreaResponseDto } from '../dtos/assessment/question-response.dto';

@ApiTags('Assessment')
@Controller('assessment')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AssessmentController {
  constructor(
    private readonly getQuestionByAreaIdUseCase: GetQuestionByAreaIdUseCase,
  ) {}

  @Get('area/:id')
  @DefaultThrottle() // 🌐 Rate limited
  @ApiOperation({
    summary: 'Get questions by areas',
    description: 'Rate limited: 100 requests per minute per IP',
  })
  @ApiResponse({
    status: 200,
    description: 'Questions for the area',
    type: GetQuestionsByAreaResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - rate limit exceeded',
  })
  async byAreas(
    @Param('id') areaId: string,
  ): Promise<GetQuestionsByAreaResponseDto> {
    try {
      const areaIdVO = new AreaId(areaId);
      const questions = await this.getQuestionByAreaIdUseCase.execute(areaIdVO);

      // Format response
      const formattedQuestions = questions.map((question) => ({
        id: question.id.getValue(),
        text: question.text,
        type: question.type || 'boolean',
        order: question.order || 0,
        isRequired: question.isRequired !== false, // Default to true
      }));

      return {
        questions: formattedQuestions,
        totalQuestions: questions.length,
        area: {
          id: areaId,
          name:
            questions.length > 0
              ? questions[0].area?.description ||
                questions[0].area?.name ||
                'Unknown Area'
              : 'Unknown Area',
        },
      };
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Question by areas not found'
      ) {
        throw new NotFoundException('Question by areas not found');
      }
      throw error;
    }
  }
}
