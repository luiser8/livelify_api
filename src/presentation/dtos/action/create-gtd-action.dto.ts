import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateGtdActionDto {
  @ApiProperty({
    description: 'ID of the goal to create action for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  goalId: string;

  @ApiProperty({
    description: 'Action title',
    example: 'Open savings account',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Action description',
    example: 'Research and open a high-yield savings account',
    required: false,
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: 'Energy level required',
    enum: ['HIGH', 'MEDIUM', 'LOW'],
    example: 'MEDIUM',
  })
  @IsEnum(['HIGH', 'MEDIUM', 'LOW'])
  energy: 'HIGH' | 'MEDIUM' | 'LOW';

  @ApiProperty({
    description: 'Time estimate in minutes',
    example: 60,
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  timeEstimate?: number;

  @ApiProperty({
    description: 'Due date for the action',
    example: '2024-12-31T23:59:59.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({
    description: 'Context ID for the action',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsString()
  contextId?: string;
}

export class GtdActionResponseDto {
  @ApiProperty({
    description: 'Action ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Goal ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  goalId: string;

  @ApiProperty({
    description: 'Context ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  contextId?: string;

  @ApiProperty({
    description: 'Context name',
    example: 'Office',
  })
  contextName: string;

  @ApiProperty({
    description: 'Action title',
    example: 'Open savings account',
  })
  title: string;

  @ApiProperty({
    description: 'Action description',
    example: 'Research and open a high-yield savings account',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Energy level required',
    enum: ['HIGH', 'MEDIUM', 'LOW'],
    example: 'MEDIUM',
  })
  energy: 'HIGH' | 'MEDIUM' | 'LOW';

  @ApiProperty({
    description: 'Time estimate in minutes',
    example: 60,
    required: false,
  })
  timeEstimate?: number;

  @ApiProperty({
    description: 'Due date',
    example: '2024-12-31T23:59:59.000Z',
    required: false,
  })
  dueDate?: Date;

  @ApiProperty({
    description: 'Whether the action is completed',
    example: false,
  })
  completed: boolean;

  @ApiProperty({
    description: 'Completion date',
    example: '2024-01-15T10:30:00.000Z',
    required: false,
  })
  completedAt?: Date;

  @ApiProperty({
    description: 'Whether the action is overdue',
    example: false,
  })
  isOverdue: boolean;

  @ApiProperty({
    description: 'Days until due (negative if overdue)',
    example: 15,
    required: false,
  })
  daysUntilDue?: number;

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

export class CreateGtdActionResponseDto {
  @ApiProperty({
    description: 'Created action information',
    type: GtdActionResponseDto,
  })
  action: GtdActionResponseDto;
}
