import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateUserSubscriptionDto {
  // @ApiProperty({
  //   description: 'User ID',
  //   example: 'user-id-123',
  // })
  // @IsString()
  // userId: string;

  @ApiProperty({
    description: 'Plan ID',
    example: 'plan-id-123',
  })
  @IsString()
  planId: string;
}
