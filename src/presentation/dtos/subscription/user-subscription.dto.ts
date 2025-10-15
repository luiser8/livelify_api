import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod, PaymentProvider } from '@prisma/client';

class SubscriptionPlanDto {
  @ApiProperty({ example: 'uuid-plan-id' })
  id: string;

  @ApiProperty({
    example: 'MONTHLY',
    enum: ['MONTHLY', 'QUARTERLY', 'SEMESTER', 'ANNUAL'],
  })
  name: string;

  @ApiProperty({
    example: 'Perfect for trying out the platform',
    required: false,
  })
  description?: string;

  @ApiProperty({ example: 19.99 })
  basePrice: number;

  @ApiProperty({ example: 19.99 })
  pricePerMonth: number;

  @ApiProperty({ example: 0, required: false })
  savings?: number;

  @ApiProperty({ example: 0, required: false })
  discount?: number;

  @ApiProperty({ example: 1 })
  billingCycle: number;

  @ApiProperty({ example: 'Mensual' })
  bestFor: string;

  @ApiProperty({
    example: { actions: 1000, projects: 50, analytics: 'ENABLED' },
  })
  features: Record<string, unknown>;
}

export class UserSubscriptionResponseDto {
  @ApiProperty({ example: 'uuid-subscription-id' })
  id: string;

  @ApiProperty({ example: 'currency-id-123' })
  currencyId: string;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  startDate: Date;

  @ApiProperty({ example: '2025-02-01T00:00:00.000Z' })
  endDate: Date;

  @ApiProperty({ example: '2025-02-01T00:00:00.000Z', required: false })
  renewalDate?: Date;

  @ApiProperty({ example: true })
  active: boolean;

  @ApiProperty({ example: true })
  autoRenew: boolean;

  @ApiProperty({ example: 19.99, required: false })
  amountPaid?: number;

  @ApiProperty({
    example: 'CREDIT_CARD',
    enum: ['CREDIT_CARD', 'PAYPAL', 'BANK_TRANSFER'],
    required: false,
  })
  paymentMethod?: PaymentMethod;

  @ApiProperty({
    example: 'STRIPE',
    enum: ['STRIPE', 'MERCADO_PAGO', 'OTHER'],
    required: false,
  })
  paymentProvider?: PaymentProvider;

  @ApiProperty({ type: SubscriptionPlanDto, required: false })
  plan?: SubscriptionPlanDto;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-02T00:00:00.000Z' })
  updatedAt: Date;
}
