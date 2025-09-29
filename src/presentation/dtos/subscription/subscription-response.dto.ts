import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionResponseDto {
  @ApiProperty({
    description: 'Subscription plan ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Subscription plan name',
    example: 'Premium',
  })
  name: string;

  @ApiProperty({
    description: 'Subscription plan description',
    example: 'Full access to all features',
  })
  description: string;

  @ApiProperty({
    description: 'Monthly price',
    example: 29.99,
  })
  price: number;

  @ApiProperty({
    description: 'Plan type',
    example: 'PREMIUM',
  })
  planType: string;

  @ApiProperty({
    description: 'Features included',
    example: ['Unlimited projects', 'Advanced analytics', 'Priority support'],
    type: [String],
  })
  features: string[];

  @ApiProperty({
    description: 'Whether the plan is active',
    example: true,
  })
  isActive: boolean;
}

export class GetAllSubscriptionsResponseDto {
  @ApiProperty({
    description: 'List of available subscription plans',
    type: [SubscriptionResponseDto],
  })
  subscriptions: SubscriptionResponseDto[];
}
