import { v4 as uuidv4 } from 'uuid';

export class ActionBudgetId {
  private readonly _value: string;

  private constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('ActionBudgetId cannot be empty');
    }
    this._value = value;
  }

  public static create(): ActionBudgetId {
    return new ActionBudgetId(uuidv4());
  }

  public static fromString(value: string): ActionBudgetId {
    return new ActionBudgetId(value);
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other: ActionBudgetId): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
