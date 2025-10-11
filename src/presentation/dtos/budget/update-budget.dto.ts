import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Length } from 'class-validator';
import { BudgetResponseDto } from './create-budget.dto';

export class UpdateBudgetDto {
  @ApiProperty({
    description: 'Currency code (ISO 4217)',
    example: 'USD',
    required: false,
    minLength: 3,
    maxLength: 3,
  })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currencyCode?: string;

  @ApiProperty({
    description: 'Monthly income target (IMO)',
    example: 5000,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyIncomeTarget?: number;

  @ApiProperty({
    description: 'Daily income target (IDO)',
    example: 166.67,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyIncomeTarget?: number;
}

export class UpdateBudgetResponseDto {
  @ApiProperty({
    description: 'Updated budget information',
    type: BudgetResponseDto,
  })
  budget: BudgetResponseDto;
}
