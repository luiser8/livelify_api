import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateProjectGoalDto {
  @ApiProperty({
    description: 'ID of the project detail to create goal for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  projectDetailId: string;

  @ApiProperty({
    description: 'Type of goal',
    enum: ['BE', 'DO', 'HAVE'],
    example: 'HAVE',
  })
  @IsEnum(['BE', 'DO', 'HAVE'])
  goalType: 'BE' | 'DO' | 'HAVE';

  @ApiProperty({
    description: 'Goal content/description',
    example: 'Save $10,000 for emergency fund',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  content: string;

  @ApiProperty({
    description: 'Cost associated with the goal',
    example: 10000,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @ApiProperty({
    description: 'Amount already saved towards the goal',
    example: 2500,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  saved?: number;
}

export class ProjectGoalResponseDto {
  @ApiProperty({
    description: 'Goal ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Project detail ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  projectDetailId: string;

  @ApiProperty({
    description: 'Goal type',
    enum: ['BE', 'DO', 'HAVE'],
    example: 'HAVE',
  })
  goalType: 'BE' | 'DO' | 'HAVE';

  @ApiProperty({
    description: 'Goal content',
    example: 'Save $10,000 for emergency fund',
  })
  content: string;

  @ApiProperty({
    description: 'Cost associated with the goal',
    example: 10000,
    required: false,
  })
  cost?: number;

  @ApiProperty({
    description: 'Amount saved towards the goal',
    example: 2500,
    required: false,
  })
  saved?: number;

  @ApiProperty({
    description: 'Progress percentage (0-100)',
    example: 25,
  })
  progress: number;

  @ApiProperty({
    description: 'Whether the goal is completed',
    example: false,
  })
  isCompleted: boolean;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class CreateProjectGoalResponseDto {
  @ApiProperty({
    description: 'Created goal information',
    type: ProjectGoalResponseDto,
  })
  goal: ProjectGoalResponseDto;
}
