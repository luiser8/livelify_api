import { v4 as uuidv4 } from 'uuid';

export class LifeWheelAreaId {
  private readonly value: string;

  constructor(value: string) {
    this.validateId(value);
    this.value = value;
  }

  private validateId(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('LifeWheelArea ID must be a non-empty string');
    }

    // UUID validation regex
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error('LifeWheelArea ID must be a valid UUID');
    }
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: LifeWheelAreaId): boolean {
    return this.value === other.value;
  }

  public static create(): LifeWheelAreaId {
    return new LifeWheelAreaId(uuidv4());
  }

  public static fromString(value: string): LifeWheelAreaId {
    return new LifeWheelAreaId(value);
  }

  public toString(): string {
    return this.value;
  }
}
