import { CurrencyId } from '../../value-objects/currency/currency-id.value-object';

export interface CurrencyProps {
  id: CurrencyId;
  code: string;
  name: string;
  symbol: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Currency {
  private readonly _id: CurrencyId;
  private readonly _code: string;
  private readonly _name: string;
  private readonly _symbol: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: CurrencyProps) {
    this._id = props.id;
    this._code = props.code;
    this._name = props.name;
    this._symbol = props.symbol;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();

    this.validate();
  }

  public static create(code: string, name: string, symbol: string): Currency {
    return new Currency({
      id: CurrencyId.create(),
      code: code.toUpperCase(),
      name,
      symbol,
    });
  }

  public static reconstitute(props: CurrencyProps): Currency {
    return new Currency(props);
  }

  private validate(): void {
    if (!this._code || this._code.length !== 3) {
      throw new Error('Currency code must be exactly 3 characters');
    }
    if (!this._name || this._name.trim().length === 0) {
      throw new Error('Currency name cannot be empty');
    }
    if (!this._symbol || this._symbol.trim().length === 0) {
      throw new Error('Currency symbol cannot be empty');
    }
  }

  // Getters
  public get id(): CurrencyId {
    return this._id;
  }

  public get code(): string {
    return this._code;
  }

  public get name(): string {
    return this._name;
  }

  public get symbol(): string {
    return this._symbol;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  protected touch(): void {
    this._updatedAt = new Date();
  }
}
