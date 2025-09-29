import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateUserSubscriptionDto {
  @ApiProperty({
    description: 'ID',
    example: 'id-123',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Plan ID',
    example: 'plan-id-123',
  })
  @IsString()
  planId: string;
}
