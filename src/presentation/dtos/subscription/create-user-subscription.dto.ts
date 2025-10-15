import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { PaymentMethod, PaymentProvider } from '@prisma/client';

export class CreateUserSubscriptionDto {
  @ApiProperty({
    description: 'Plan ID',
    example: 'plan-id-123',
  })
  @IsString()
  planId: string;

  @ApiProperty({
    description: 'Currency ID',
    example: 'currency-id-123',
    default: 'default-currency-id', // Se puede configurar una moneda por defecto
  })
  @IsString()
  @IsOptional()
  currencyId?: string;

  @ApiProperty({
    description: 'Amount paid for the subscription',
    example: 19.99,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  amountPaid?: number;

  @ApiProperty({
    description: 'Payment method used',
    enum: PaymentMethod,
    example: 'CREDIT_CARD',
    required: false,
  })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiProperty({
    description: 'Payment provider used',
    enum: PaymentProvider,
    example: 'STRIPE',
    required: false,
  })
  @IsEnum(PaymentProvider)
  @IsOptional()
  paymentProvider?: PaymentProvider;
}
