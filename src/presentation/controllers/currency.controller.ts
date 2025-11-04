import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GetAvailableCurrenciesUseCase } from '../../application/use-cases/currency/get-available-currencies.use-case';
import { GetAvailableCurrenciesResponseDto } from '../dtos/currency/get-currencies.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { DefaultThrottle } from '../decorators/throttle.decorator';

@ApiTags('Currencies')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('currencies')
export class CurrencyController {
  constructor(
    private readonly getAvailableCurrenciesUseCase: GetAvailableCurrenciesUseCase,
  ) {}

  @Get('all')
  @DefaultThrottle() // 🌐 Rate limited
  @ApiOperation({
    summary: 'Get available currencies',
    description: 'Retrieves all available currencies for budget creation',
  })
  @ApiResponse({
    status: 200,
    description: 'Available currencies retrieved successfully',
    type: GetAvailableCurrenciesResponseDto,
  })
  async getAvailableCurrencies(): Promise<GetAvailableCurrenciesResponseDto> {
    return await this.getAvailableCurrenciesUseCase.execute();
  }
}
