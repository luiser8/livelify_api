import { ApiProperty } from '@nestjs/swagger';

export class BudgetWithProjectResponseDto {
  @ApiProperty({
    description: 'Budget ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  projectId: string;

  @ApiProperty({
    description: 'Project title',
    example: 'Improve Physical Fitness',
  })
  projectTitle: string;

  @ApiProperty({
    description: 'Project description',
    example: 'A comprehensive plan to get in better shape',
    required: false,
  })
  projectDescription?: string;

  @ApiProperty({
    description: 'Life area name',
    example: 'Health & Fitness',
  })
  areaName: string;

  @ApiProperty({
    description: 'Monthly income target',
    example: 5000,
    required: false,
  })
  monthlyIncomeTarget?: number;

  @ApiProperty({
    description: 'Daily income target',
    example: 166.67,
    required: false,
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

export class GetUserBudgetsResponseDto {
  @ApiProperty({
    description: 'List of user budgets with project information',
    type: [BudgetWithProjectResponseDto],
  })
  budgets: BudgetWithProjectResponseDto[];

  @ApiProperty({
    description: 'Total number of budgets',
    example: 3,
  })
  totalBudgets: number;

  @ApiProperty({
    description: 'Total monthly income target across all budgets',
    example: 15000,
  })
  totalMonthlyTarget: number;

  @ApiProperty({
    description: 'Total daily income target across all budgets',
    example: 500,
  })
  totalDailyTarget: number;

  @ApiProperty({
    description: 'List of currencies used in budgets',
    example: ['USD', 'EUR'],
    type: [String],
  })
  currenciesUsed: string[];
}
