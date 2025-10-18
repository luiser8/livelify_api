import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { PaymentMethod, PaymentProvider } from '@prisma/client';

export class UpdateUserSubscriptionDto {
  @ApiProperty({
    description: 'Subscription ID',
    example: 'subscription-id-123',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Plan ID to change to',
    example: 'plan-id-123',
    required: false,
  })
  @IsString()
  @IsOptional()
  planId?: string;

  @ApiProperty({
    description: 'Currency ID',
    example: 'currency-id-123',
    required: false,
  })
  @IsString()
  @IsOptional()
  currencyId?: string;

  @ApiProperty({
    description: 'Auto-renew status',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  autoRenew?: boolean;

  @ApiProperty({
    description: 'Amount paid for the subscription',
    example: 19.99,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  amountPaid?: number;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: 'CREDIT_CARD',
    required: false,
  })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiProperty({
    description: 'Payment provider',
    enum: PaymentProvider,
    example: 'STRIPE',
    required: false,
  })
  @IsEnum(PaymentProvider)
  @IsOptional()
  paymentProvider?: PaymentProvider;
}
