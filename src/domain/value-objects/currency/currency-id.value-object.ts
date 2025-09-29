import { v4 as uuidv4 } from 'uuid';

export class CurrencyId {
  private readonly _value: string;

  private constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('CurrencyId cannot be empty');
    }
    this._value = value;
  }

  public static create(): CurrencyId {
    return new CurrencyId(uuidv4());
  }

  public static fromString(value: string): CurrencyId {
    return new CurrencyId(value);
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other: CurrencyId): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
