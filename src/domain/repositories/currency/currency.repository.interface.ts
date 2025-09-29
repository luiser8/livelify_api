import { Currency } from '../../entities/currency/currency.entity';
import { CurrencyId } from '../../value-objects/currency/currency-id.value-object';

export interface CurrencyRepositoryInterface {
  save(currency: Currency): Promise<Currency>;
  findById(id: CurrencyId): Promise<Currency | null>;
  findByCode(code: string): Promise<Currency | null>;
  findAll(): Promise<Currency[]>;
  update(currency: Currency): Promise<Currency>;
  delete(id: CurrencyId): Promise<void>;
}
