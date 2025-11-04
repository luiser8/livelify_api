import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
  MaxLength,
  Length,
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
