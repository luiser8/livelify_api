import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CurrencyRepositoryInterface } from '../../../domain/repositories/currency/currency.repository.interface';
import { Currency } from '../../../domain/entities/currency/currency.entity';
import { CurrencyId } from '../../../domain/value-objects/currency/currency-id.value-object';

@Injectable()
export class CurrencyRepository implements CurrencyRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async save(currency: Currency): Promise<Currency> {
    const data = {
      id: currency.id.getValue(),
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      createdAt: currency.createdAt,
      updatedAt: currency.updatedAt,
    };

    const savedCurrency = await this.prisma.currency.create({ data });
    return this.toDomainEntity(savedCurrency);
  }

  async findById(id: CurrencyId): Promise<Currency | null> {
    const currency = await this.prisma.currency.findUnique({
      where: { id: id.getValue() },
    });

    return currency ? this.toDomainEntity(currency) : null;
  }

  async findByCode(code: string): Promise<Currency | null> {
    const currency = await this.prisma.currency.findUnique({
      where: { code: code.toUpperCase() },
    });

    return currency ? this.toDomainEntity(currency) : null;
  }

  async findAll(): Promise<Currency[]> {
    const currencies = await this.prisma.currency.findMany({
      orderBy: { code: 'asc' },
    });

    return currencies.map((currency) => this.toDomainEntity(currency));
  }

  async update(currency: Currency): Promise<Currency> {
    const data = {
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      updatedAt: currency.updatedAt,
    };

    const updatedCurrency = await this.prisma.currency.update({
      where: { id: currency.id.getValue() },
      data,
    });

    return this.toDomainEntity(updatedCurrency);
  }

  async delete(id: CurrencyId): Promise<void> {
    await this.prisma.currency.delete({
      where: { id: id.getValue() },
    });
  }

  private toDomainEntity(value: any): Currency {
    return Currency.reconstitute({
      id: CurrencyId.fromString(value.id),
      code: value.code,
      name: value.name,
      symbol: value.symbol,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    });
  }
}
