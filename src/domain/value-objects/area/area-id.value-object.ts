import { randomUUID } from 'crypto';

export class AreaId {
  private readonly value: string;

  constructor(id?: string) {
    this.value = id || randomUUID();
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: AreaId): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  public static create(): AreaId {
    return new AreaId();
  }

  public static fromString(id: string): AreaId {
    return new AreaId(id);
  }
}
