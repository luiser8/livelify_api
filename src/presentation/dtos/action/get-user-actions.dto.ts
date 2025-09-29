import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { GtdActionResponseDto } from './create-gtd-action.dto';

export class GetUserActionsQueryDto {
  @ApiProperty({
    description: 'Filter actions by status',
    enum: ['all', 'pending', 'completed', 'overdue'],
    example: 'pending',
    required: false,
  })
  @IsOptional()
  @IsEnum(['all', 'pending', 'completed', 'overdue'])
  filter?: 'all' | 'pending' | 'completed' | 'overdue';
}

export class GetUserActionsResponseDto {
  @ApiProperty({
    description: 'List of user actions',
    type: [GtdActionResponseDto],
  })
  actions: GtdActionResponseDto[];

  @ApiProperty({
    description: 'Total number of actions',
    example: 25,
  })
  totalActions: number;

  @ApiProperty({
    description: 'Number of completed actions',
    example: 10,
  })
  completedActions: number;

  @ApiProperty({
    description: 'Number of pending actions',
    example: 12,
  })
  pendingActions: number;

  @ApiProperty({
    description: 'Number of overdue actions',
    example: 3,
  })
  overdueActions: number;
}
