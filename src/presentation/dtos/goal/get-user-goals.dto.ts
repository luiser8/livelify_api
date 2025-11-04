import { ApiProperty } from '@nestjs/swagger';
import { ProjectGoalResponseDto } from './create-project-goal.dto';

export class GoalWithProjectResponseDto {
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

  @ApiProperty({
    description:
      'Total monthly budget (IMO) - sum of all action budgets for this goal',
    example: 1500.5,
    nullable: true,
  })
  totalMonthlyBudget: number | null;

  @ApiProperty({
    description:
      'Total daily budget (IDO) - sum of all action budgets for this goal',
    example: 50.25,
    nullable: true,
  })
  totalDailyBudget: number | null;
}

export class GoalsByTypeDto {
  @ApiProperty({
    description: 'Number of BE goals',
    example: 3,
  })
  BE: number;

  @ApiProperty({
    description: 'Number of DO goals',
    example: 5,
  })
  DO: number;

  @ApiProperty({
    description: 'Number of HAVE goals',
    example: 2,
  })
  HAVE: number;
}

export class GetUserGoalsResponseDto {
  @ApiProperty({
    description: 'List of user goals with project information',
    type: [GoalWithProjectResponseDto],
  })
  goals: GoalWithProjectResponseDto[];

  @ApiProperty({
    description: 'Total number of goals',
    example: 10,
  })
  totalGoals: number;

  @ApiProperty({
    description: 'Goals count by type',
    type: GoalsByTypeDto,
  })
  goalsByType: GoalsByTypeDto;
}
