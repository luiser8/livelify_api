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

  // Campos para crear presupuesto del goal (reemplazan cost y saved)
  @ApiProperty({
    description:
      'Base capital for goal budget (optional). If provided, budget will be created automatically with multiplier 1.3',
    example: 3000,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  baseCapital?: number;

  @ApiProperty({
    description:
      'Currency code for budget (required if baseCapital is provided)',
    example: 'USD',
    required: false,
    minLength: 3,
    maxLength: 3,
  })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currencyCode?: string;
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

export class GoalBudgetResponseDto {
  @ApiProperty({
    description: 'Goal Budget ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Base capital',
    example: 3000,
  })
  baseCapital: number;

  @ApiProperty({
    description: 'Multiplier factor (constant: 1.3)',
    example: 1.3,
  })
  multiplier: number;

  @ApiProperty({
    description: 'Total capital (baseCapital * multiplier)',
    example: 3900,
  })
  totalCapital: number;

  @ApiProperty({
    description: 'Monthly budget (IMO) = totalCapital / project months',
    example: 650,
  })
  monthlyBudget: number;

  @ApiProperty({
    description: 'Daily budget (IDO) = totalCapital / project days',
    example: 21.66,
  })
  dailyBudget: number;

  @ApiProperty({
    description: 'Project duration in months',
    example: 6,
  })
  projectMonths: number;

  @ApiProperty({
    description: 'Project duration in days',
    example: 180,
  })
  projectDays: number;

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

export class CreateProjectGoalResponseDto {
  @ApiProperty({
    description: 'Created goal information',
    type: ProjectGoalResponseDto,
  })
  goal: ProjectGoalResponseDto;

  @ApiProperty({
    description: 'Goal budget information (if budget was created)',
    type: GoalBudgetResponseDto,
    required: false,
  })
  budget?: GoalBudgetResponseDto;
}
