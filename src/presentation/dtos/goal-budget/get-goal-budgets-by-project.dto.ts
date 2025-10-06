import { ApiProperty } from '@nestjs/swagger';
import { GoalBudgetResponseDto } from './create-goal-budget.dto';

export class GetGoalBudgetsByProjectResponseDto {
  @ApiProperty({
    description: 'List of goal budgets for the project',
    type: [GoalBudgetResponseDto],
  })
  goalBudgets: GoalBudgetResponseDto[];

  @ApiProperty({
    description: 'Total base capital of all goals',
    example: 9000,
  })
  totalBaseCapital: number;

  @ApiProperty({
    description: 'Total capital of all goals',
    example: 11700,
  })
  totalCapital: number;

  @ApiProperty({
    description: 'Total monthly budget (IMO) of all goals',
    example: 1950,
  })
  totalMonthlyBudget: number;

  @ApiProperty({
    description: 'Total daily budget (IDO) of all goals',
    example: 65,
  })
  totalDailyBudget: number;
}
