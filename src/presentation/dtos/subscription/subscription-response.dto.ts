import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionResponseDto {
  @ApiProperty({
    description: 'Subscription plan ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Subscription plan name',
    example: 'MONTHLY',
    enum: ['MONTHLY', 'QUARTERLY', 'SEMESTER', 'ANNUAL'],
  })
  name: string;

  @ApiProperty({
    description: 'Subscription plan description',
    example: 'Perfect for trying out the platform',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Base price for the billing period',
    example: 19.99,
  })
  basePrice: number;

  @ApiProperty({
    description: 'Price per month (calculated)',
    example: 19.99,
  })
  pricePerMonth: number;

  @ApiProperty({
    description: 'Savings compared to monthly plan',
    example: 0,
    required: false,
  })
  savings?: number;

  @ApiProperty({
    description: 'Discount percentage',
    example: 0,
    required: false,
  })
  discount?: number;

  @ApiProperty({
    description: 'Billing cycle duration in months',
    example: 1,
  })
  billingCycle: number;

  @ApiProperty({
    description: 'Best for description',
    example: 'Mensual',
  })
  bestFor: string;

  @ApiProperty({
    description: 'Features included',
    example: { actions: 1000, projects: 50, analytics: 'ENABLED' },
  })
  features: Record<string, any>;

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
