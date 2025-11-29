/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod, PaymentProvider } from '@prisma/client';

// User basic info
export class UserBasicInfoDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'First name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890',
    required: false,
  })
  phone?: string;

  @ApiProperty({
    description: 'Address',
    example: '123 Main St',
    required: false,
  })
  address?: string;

  @ApiProperty({
    description: 'Currency ID',
    example: 'currency-usd-id',
    required: false,
  })
  currencyId?: string;

  @ApiProperty({
    description: 'User accepted terms and conditions',
    example: true,
  })
  acceptTermsAndPolicies: boolean;
}

// Subscription Plan info for complete profile
export class SubscriptionPlanInfoDto {
  @ApiProperty({
    description: 'Plan ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Plan name',
    example: 'MONTHLY',
    enum: ['MONTHLY', 'QUARTERLY', 'SEMESTER', 'ANNUAL'],
  })
  name: string;

  @ApiProperty({
    description: 'Plan description',
    example: 'Perfect for trying out the platform',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Base price',
    example: 19.99,
  })
  basePrice: number;

  @ApiProperty({
    description: 'Price per month',
    example: 19.99,
  })
  pricePerMonth: number;

  @ApiProperty({
    description: 'Total savings',
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
    description: 'Billing cycle in months',
    example: 1,
  })
  billingCycle: number;

  @ApiProperty({
    description: 'Best for description',
    example: 'Mensual',
  })
  bestFor: string;

  @ApiProperty({
    description: 'Plan features',
    example: { actions: 1000, projects: 50, analytics: 'ENABLED' },
  })
  features: Record<string, any>;
}

// Subscription info
export class UserSubscriptionInfoDto {
  @ApiProperty({
    description: 'Subscription ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Currency ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  currencyId: string;

  @ApiProperty({
    description: 'Subscription start date',
    example: '2025-01-01T00:00:00.000Z',
  })
  startDate: Date;

  @ApiProperty({
    description: 'Subscription end date',
    example: '2025-02-01T00:00:00.000Z',
  })
  endDate: Date;

  @ApiProperty({
    description: 'Renewal date',
    example: '2025-02-01T00:00:00.000Z',
    required: false,
  })
  renewalDate?: Date;

  @ApiProperty({
    description: 'Is subscription active',
    example: true,
  })
  active: boolean;

  @ApiProperty({
    description: 'Auto-renew enabled',
    example: true,
  })
  autoRenew: boolean;

  @ApiProperty({
    description: 'Amount paid for this subscription',
    example: 19.99,
    required: false,
  })
  amountPaid?: number;

  @ApiProperty({
    description: 'Payment method',
    example: 'CREDIT_CARD',
    enum: ['CREDIT_CARD', 'PAYPAL', 'BANK_TRANSFER'],
    required: false,
  })
  paymentMethod?: PaymentMethod;

  @ApiProperty({
    description: 'Payment provider',
    example: 'STRIPE',
    enum: ['STRIPE', 'MERCADO_PAGO', 'OTHER'],
    required: false,
  })
  paymentProvider?: PaymentProvider;

  @ApiProperty({
    description: 'Plan details',
    type: SubscriptionPlanInfoDto,
    required: false,
  })
  plan?: SubscriptionPlanInfoDto;

  @ApiProperty({
    description: 'Subscription creation date',
    example: '2025-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Subscription last update date',
    example: '2025-01-02T00:00:00.000Z',
  })
  updatedAt: Date;
}

// Context info
export class UserContextInfoDto {
  @ApiProperty({
    description: 'Context ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Context name',
    example: '@Office',
  })
  name: string;

  @ApiProperty({
    description: 'Creation date',
    example: '2025-09-29T02:00:13.365Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2025-09-29T02:00:13.365Z',
  })
  updatedAt: Date;
}

// Action info
export class ActionInfoDto {
  @ApiProperty({
    description: 'Action ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Action title',
    example: 'Open savings account',
  })
  title: string;

  @ApiProperty({
    description: 'Context name',
    example: '@Office',
  })
  contextName: string;

  @ApiProperty({
    description: 'Energy level',
    enum: ['HIGH', 'MEDIUM', 'LOW'],
    example: 'MEDIUM',
  })
  energy: string;

  @ApiProperty({
    description: 'Is completed',
    example: false,
  })
  completed: boolean;

  @ApiProperty({
    description: 'Due date',
    example: '2024-12-31T23:59:59.000Z',
    required: false,
  })
  dueDate?: Date;

  @ApiProperty({
    description: 'Is overdue',
    example: false,
  })
  isOverdue: boolean;
}

// Goal info
export class GoalInfoDto {
  @ApiProperty({
    description: 'Goal ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Goal type',
    enum: ['BE', 'DO', 'HAVE'],
    example: 'HAVE',
  })
  goalType: string;

  @ApiProperty({
    description: 'Goal content',
    example: 'Save $10,000 for emergency fund',
  })
  content: string;

  @ApiProperty({
    description: 'Actions associated with this goal',
    type: [ActionInfoDto],
  })
  actions: ActionInfoDto[];
}

// Budget info
export class BudgetInfoDto {
  @ApiProperty({
    description: 'Budget ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

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
    description: 'Currency information',
    example: {
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
    },
  })
  currency: {
    code: string;
    name: string;
    symbol: string;
  };
}

// Project info
export class ProjectInfoDto {
  @ApiProperty({
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Project title',
    example: 'Improve Physical Fitness',
  })
  title: string;

  @ApiProperty({
    description: 'Project description',
    example: 'A comprehensive plan to get in better shape',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Project status',
    example: 'ACTIVE',
  })
  status: string;

  @ApiProperty({
    description: 'Budget associated with this project',
    type: BudgetInfoDto,
    required: false,
  })
  budget?: BudgetInfoDto;

  @ApiProperty({
    description: 'Goals associated with this project',
    type: [GoalInfoDto],
  })
  goals: GoalInfoDto[];
}

// LifeWheelArea info
export class LifeWheelAreaInfoDto {
  @ApiProperty({
    description: 'LifeWheelArea ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Area ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  areaId: string;

  @ApiProperty({
    description: 'Area name',
    example: 'Health & Fitness',
  })
  areaName: string;

  @ApiProperty({
    description: 'Area score',
    example: 7.5,
  })
  score: number;

  @ApiProperty({
    description: 'Projects in this area',
    type: [ProjectInfoDto],
  })
  projects: ProjectInfoDto[];
}

// LifeWheel info
export class LifeWheelInfoDto {
  @ApiProperty({
    description: 'LifeWheel ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Global score',
    example: 6.8,
  })
  globalScore: number;

  @ApiProperty({
    description: 'Life areas',
    type: [LifeWheelAreaInfoDto],
  })
  lifeAreas: LifeWheelAreaInfoDto[];
}

// Complete user profile response
export class UserCompleteProfileResponseDto {
  @ApiProperty({
    description: 'User basic information',
    type: UserBasicInfoDto,
  })
  user: UserBasicInfoDto;

  @ApiProperty({
    description: 'User subscription information',
    type: UserSubscriptionInfoDto,
    required: false,
  })
  subscription?: UserSubscriptionInfoDto;

  @ApiProperty({
    description: 'User contexts',
    type: [UserContextInfoDto],
  })
  contexts: UserContextInfoDto[];

  @ApiProperty({
    description: 'User life wheel',
    type: LifeWheelInfoDto,
    required: false,
  })
  lifeWheel?: LifeWheelInfoDto;

  @ApiProperty({
    description: 'Summary statistics',
    example: {
      totalProjects: 5,
      totalGoals: 12,
      totalActions: 25,
      completedGoals: 3,
      completedActions: 8,
      overdueActions: 2,
    },
  })
  summary: {
    totalProjects: number;
    totalGoals: number;
    totalActions: number;
    completedGoals: number;
    completedActions: number;
    overdueActions: number;
  };
}
