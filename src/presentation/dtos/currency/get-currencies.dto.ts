import { ApiProperty } from '@nestjs/swagger';

export class CurrencyResponseDto {
  @ApiProperty({
    description: 'Currency ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Currency code (ISO 4217)',
    example: 'USD',
  })
  code: string;

  @ApiProperty({
    description: 'Currency name',
    example: 'US Dollar',
  })
  name: string;

  @ApiProperty({
    description: 'Currency symbol',
    example: '$',
  })
  symbol: string;
}

export class GetAvailableCurrenciesResponseDto {
  @ApiProperty({
    description: 'List of available currencies',
    type: [CurrencyResponseDto],
  })
  currencies: CurrencyResponseDto[];
}
