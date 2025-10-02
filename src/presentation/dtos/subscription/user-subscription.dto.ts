import { ApiProperty } from '@nestjs/swagger';

class SubscriptionPlanDto {
  @ApiProperty({ example: 'uuid-plan-id' })
  id: string;

  @ApiProperty({ example: 'PREMIUM' })
  name: string;

  @ApiProperty({ example: 'Full access to all features' })
  description: string;

  @ApiProperty({ example: '19.99' })
  price: string;

  @ApiProperty({
    example: { actions: 1000, projects: 50, analytics: 'ENABLED' },
  })
  features: {
    actions: number;
    projects: number;
    analytics: string;
  };
}

export class UserSubscriptionResponseDto {
  @ApiProperty({ example: 'uuid-subscription-id' })
  id: string;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  startDate: Date;

  @ApiProperty({ example: '2025-02-01T00:00:00.000Z' })
  renewalDate: Date;

  @ApiProperty({ example: true })
  active: boolean;

  @ApiProperty({ type: SubscriptionPlanDto, required: false })
  plan?: SubscriptionPlanDto;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-02T00:00:00.000Z' })
  updatedAt: Date;
  planName: string;
  price: number;
  isActive: boolean;
  endDate: Date;
}
