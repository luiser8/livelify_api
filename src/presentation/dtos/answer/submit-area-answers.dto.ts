import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerDto {
  @ApiProperty({
    description: 'Question ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  questionId: string;

  @ApiProperty({
    description: 'Answer value (true = Yes, false = No)',
    example: true,
  })
  @IsBoolean()
  value: boolean;
}

export class SubmitAreaAnswersDto {
  @ApiProperty({
    description: 'Area ID for which answers are being submitted',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  areaId: string;

  @ApiProperty({
    description:
      'Array of answers for questions in this area (max 10 questions per area)',
    type: [AnswerDto],
    minItems: 1,
    maxItems: 10,
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one answer is required' })
  @ArrayMaxSize(10, { message: 'Maximum 10 answers per area allowed' })
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}

export class SubmitAreaAnswersResponseDto {
  @ApiProperty({
    description: 'Whether the submission was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Calculated score for this area (0-10)',
    example: 7.5,
  })
  areaScore: number;

  @ApiProperty({
    description: 'Updated global score across all areas (0-10)',
    example: 6.8,
  })
  globalScore: number;

  @ApiProperty({
    description: 'Number of answers submitted in this request',
    example: 5,
  })
  answersSubmitted: number;

  @ApiProperty({
    description: 'Total number of answers for this area',
    example: 8,
  })
  totalAnswersForArea: number;

  @ApiProperty({
    description: 'Name of the area',
    example: 'PERSONAL_DEVELOPMENT',
  })
  areaName: string;

  @ApiProperty({
    description: 'Success/status message',
    example:
      '5 answers submitted for PERSONAL_DEVELOPMENT. 2 questions remaining.',
  })
  message: string;
}
