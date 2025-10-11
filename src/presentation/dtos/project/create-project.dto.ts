import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, MinLength, IsOptional } from 'class-validator';

export class CreateProjectFromLifeWheelAreaDto {
  @ApiProperty({
    description: 'LifeWheelArea ID to create project from',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  lifeWheelAreaId: string;

  @ApiProperty({
    description: 'Project title',
    example: 'Improve Physical Fitness',
    minLength: 3,
  })
  @IsString()
  @MinLength(3, { message: 'Project title must be at least 3 characters long' })
  title: string;

  @ApiPropertyOptional({
    description: 'Project description',
    example:
      'A comprehensive plan to improve my physical fitness through regular exercise and proper nutrition.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Project start date (ISO string)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Project end date (ISO string)',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsDateString()
  endDate: string;
}

export class ProjectDetailResponseDto {
  @ApiProperty({
    description: 'Project detail ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  projectId: string;

  @ApiProperty({
    description: 'Life area ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  lifeAreaId: string;

  @ApiProperty({
    description: 'Project detail status',
    example: 'PLANNING',
    enum: ['PLANNING', 'ACTIVE', 'COMPLETED', 'ABANDONED'],
  })
  status: string;

  @ApiProperty({
    description: 'Project start date',
    example: '2024-01-01T00:00:00.000Z',
  })
  startDate: Date;

  @ApiProperty({
    description: 'Project end date',
    example: '2024-12-31T23:59:59.000Z',
  })
  endDate: Date;

  @ApiProperty({
    description: 'Number of completed actions',
    example: 5,
  })
  completedActions: number;

  @ApiProperty({
    description: 'Total number of actions',
    example: 10,
  })
  totalActions: number;

  @ApiProperty({
    description: 'Progress percentage',
    example: 50.0,
  })
  progressPercentage: number;

  @ApiProperty({
    description: 'Creation date',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}

export class ProjectResponseDto {
  @ApiProperty({
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'LifeWheelArea ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  lifeWheelAreaId: string;

  @ApiProperty({
    description: 'Project title',
    example: 'Improve Physical Fitness',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Project description',
    example:
      'A comprehensive plan to improve my physical fitness through regular exercise and proper nutrition.',
  })
  description?: string;

  @ApiProperty({
    description: 'Project status',
    example: 'ACTIVE',
    enum: ['ACTIVE', 'SOMEDAY', 'COMPLETED', 'CANCELLED'],
  })
  status: string;

  @ApiProperty({
    description: 'Creation date',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}

export class BudgetResponseDto {
  @ApiProperty({
    description: 'Budget ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Monthly income target (IMO)',
    example: 0,
  })
  monthlyIncomeTarget: number;

  @ApiProperty({
    description: 'Daily income target (IDO)',
    example: 0,
  })
  dailyIncomeTarget: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
  })
  currencyCode: string;

  @ApiProperty({
    description: 'Currency symbol',
    example: '$',
  })
  currencySymbol: string;
}

export class CreateProjectFromLifeWheelAreaResponseDto {
  @ApiProperty({
    description: 'Created project',
    type: ProjectResponseDto,
  })
  project: ProjectResponseDto;

  @ApiProperty({
    description: 'Created project detail',
    type: ProjectDetailResponseDto,
  })
  detail: ProjectDetailResponseDto;

  @ApiProperty({
    description: 'Created project budget (initialized with 0 values)',
    type: BudgetResponseDto,
  })
  budget: BudgetResponseDto;
}
