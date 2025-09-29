import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  Length,
} from 'class-validator';

export class CreateBudgetForProjectDto {
  @ApiProperty({
    description: 'ID of the project to create budget for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({
    description: 'Currency code (ISO 4217)',
    example: 'USD',
    minLength: 3,
    maxLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  currencyCode: string;

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

export class BudgetResponseDto {
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

export class CreateBudgetForProjectResponseDto {
  @ApiProperty({
    description: 'Created budget information',
    type: BudgetResponseDto,
  })
  budget: BudgetResponseDto;
}
