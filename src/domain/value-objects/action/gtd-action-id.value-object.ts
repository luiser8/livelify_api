import { v4 as uuidv4 } from 'uuid';

export class GtdActionId {
  private readonly _value: string;

  private constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('GtdActionId cannot be empty');
    }
    this._value = value;
  }

  public static create(): GtdActionId {
    return new GtdActionId(uuidv4());
  }

  public static fromString(value: string): GtdActionId {
    return new GtdActionId(value);
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other: GtdActionId): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
