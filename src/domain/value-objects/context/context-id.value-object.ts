import { v4 as uuidv4 } from 'uuid';

export class ContextId {
  private readonly _value: string;

  private constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('ContextId cannot be empty');
    }
    this._value = value;
  }

  public static create(): ContextId {
    return new ContextId(uuidv4());
  }

  public static fromString(value: string): ContextId {
    return new ContextId(value);
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other: ContextId): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}