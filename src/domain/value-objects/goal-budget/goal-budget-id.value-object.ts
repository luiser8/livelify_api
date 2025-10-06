import { v4 as uuidv4 } from 'uuid';

export class GoalBudgetId {
  private readonly _value: string;

  private constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('GoalBudgetId cannot be empty');
    }
    this._value = value;
  }

  public static create(): GoalBudgetId {
    return new GoalBudgetId(uuidv4());
  }

  public static fromString(value: string): GoalBudgetId {
    return new GoalBudgetId(value);
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other: GoalBudgetId): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
