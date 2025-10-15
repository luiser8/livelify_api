import { ApiProperty } from '@nestjs/swagger';

export class QuestionResponseDto {
  @ApiProperty({
    description: 'Question ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Question text',
    example: 'Do you exercise regularly?',
  })
  text: string;

  @ApiProperty({
    description: 'Optional tip or hint for the question',
    example: 'Consider activities like running, yoga, or gym workouts',
    required: false,
  })
  tip?: string;

  @ApiProperty({
    description: 'Indicates if there are more than 10 questions for this area',
    example: false,
  })
  haveMoreQuestions: boolean;

  @ApiProperty({
    description: 'Whether the question is required',
    example: true,
  })
  isRequired: boolean;
}

export class GetQuestionsByAreaResponseDto {
  @ApiProperty({
    description: 'List of questions for the area',
    type: [QuestionResponseDto],
  })
  questions: QuestionResponseDto[];

  @ApiProperty({
    description: 'Total number of questions',
    example: 10,
  })
  totalQuestions: number;

  @ApiProperty({
    description: 'Area information',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Health & Fitness',
    },
  })
  area: {
    id: string;
    name: string;
  };
}
