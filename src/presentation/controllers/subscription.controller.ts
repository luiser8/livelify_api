import { Controller, Get, UseGuards, NotFoundException } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

// Guards and Decorators
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { DefaultThrottle } from '../decorators/throttle.decorator';

// DTOs

// Use Cases
import { GetAllSubscriptionsUseCase } from 'src/application/use-cases/subscription/get-all-subscriptions.use-case';
import { GetAllSubscriptionsResponseDto } from '../dtos/subscription/subscription-response.dto';

@ApiTags('Subscription')
@Controller('subscription')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SubscriptionController {
  constructor(
    private readonly getAllSubscriptionsUseCase: GetAllSubscriptionsUseCase,
  ) {}

  @Get('all')
  @DefaultThrottle() // 🌐 Rate limited
  @ApiOperation({
    summary: 'Get all subscriptions',
    description: 'Rate limited: 100 requests per minute per IP',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscriptions',
    type: GetAllSubscriptionsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - rate limit exceeded',
  })
  async all(): Promise<GetAllSubscriptionsResponseDto> {
    try {
      const subscriptions = await this.getAllSubscriptionsUseCase.execute();

      // Format response with all new fields
      const formattedSubscriptions = subscriptions.map((subscription) => ({
        id: subscription.id.getValue(),
        name: subscription.name.toString(),
        description: subscription.description || '',
        basePrice: subscription.basePrice,
        pricePerMonth: subscription.pricePerMonth,
        savings: subscription.savings,
        discount: subscription.discount,
        billingCycle: subscription.billingCycle,
        bestFor: subscription.bestFor,
        features: subscription.features,
        isActive: true,
      }));

      return {
        subscriptions: formattedSubscriptions,
      };
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Subscription not found'
      ) {
        throw new NotFoundException('Subscription not found');
      }
      throw error;
    }
  }
}
