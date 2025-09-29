import { v4 as uuidv4 } from 'uuid';

export class BudgetId {
  private readonly _value: string;

  private constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('BudgetId cannot be empty');
    }
    this._value = value;
  }

  public static create(): BudgetId {
    return new BudgetId(uuidv4());
  }

  public static fromString(value: string): BudgetId {
    return new BudgetId(value);
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other: BudgetId): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
