import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProjectBudgetDto {
  @ApiProperty({
    description: 'Budget ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiPropertyOptional({
    description: 'Monthly income target (IMO)',
    example: 650.0,
  })
  monthlyIncomeTarget?: number;

  @ApiPropertyOptional({
    description: 'Daily income target (IDO)',
    example: 21.67,
  })
  dailyIncomeTarget?: number;

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

export class ProjectDetailDto {
  @ApiProperty({
    description: 'Project detail ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Life area ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  lifeAreaId: string;

  @ApiProperty({
    description: 'Project detail status',
    example: 'ACTIVE',
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
}

export class ProjectWithDetailDto {
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

  @ApiPropertyOptional({
    description: 'Project expected score',
    example: 8,
  })
  expectedScore?: number;

  @ApiProperty({
    description: 'Creation date',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Project detail information',
    type: ProjectDetailDto,
  })
  detail?: ProjectDetailDto;

  @ApiPropertyOptional({
    description: 'Project budget information',
    type: ProjectBudgetDto,
  })
  budget?: ProjectBudgetDto;
}

export class GetUserProjectsResponseDto {
  @ApiProperty({
    description: 'List of user projects with details',
    type: [ProjectWithDetailDto],
  })
  projects: ProjectWithDetailDto[];

  @ApiProperty({
    description: 'Total number of projects',
    example: 5,
  })
  totalProjects: number;

  @ApiProperty({
    description: 'Number of active projects',
    example: 3,
  })
  activeProjects: number;

  @ApiProperty({
    description: 'Number of completed projects',
    example: 2,
  })
  completedProjects: number;
}
