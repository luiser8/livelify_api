import { Injectable, Inject } from '@nestjs/common';
import type { CurrencyRepositoryInterface } from '../../../domain/repositories/currency/currency.repository.interface';
import { CURRENCY_REPOSITORY_TOKEN } from '../../ports/budget';

export interface CurrencyResponse {
  id: string;
  code: string;
  name: string;
  symbol: string;
}

export interface GetAvailableCurrenciesResponse {
  currencies: CurrencyResponse[];
}

@Injectable()
export class GetAvailableCurrenciesUseCase {
  constructor(
    @Inject(CURRENCY_REPOSITORY_TOKEN)
    private readonly currencyRepository: CurrencyRepositoryInterface,
  ) {}

  async execute(): Promise<GetAvailableCurrenciesResponse> {
    // 1. Obtener todas las monedas disponibles
    const currencies = await this.currencyRepository.findAll();

    // 2. Mapear a la respuesta
    const currencyResponses: CurrencyResponse[] = currencies.map(
      (currency) => ({
        id: currency.id.getValue(),
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
      }),
    );

    return {
      currencies: currencyResponses,
    };
  }
}
