/* eslint-disable @typescript-eslint/no-unused-vars */
import { v4 as uuidv4 } from 'uuid';

export class LifeWheelId {
  private readonly value: string;

  constructor(value: string) {
    this.validateId(value);
    this.value = value;
  }

  private validateId(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('LifeWheel ID must be a non-empty string');
    }

    // UUID validation regex
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error('LifeWheel ID must be a valid UUID');
    }
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: LifeWheelId): boolean {
    return this.value === other.value;
  }

  public static create(): LifeWheelId {
    return new LifeWheelId(uuidv4());
  }

  public static fromString(value: string): LifeWheelId {
    return new LifeWheelId(value);
  }

  public toString(): string {
    return this.value;
  }
}
