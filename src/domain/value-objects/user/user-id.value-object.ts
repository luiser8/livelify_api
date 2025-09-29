import { randomUUID } from 'crypto';

export class UserId {
  private readonly value: string;

  constructor(id?: string) {
    this.value = id || randomUUID();
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: UserId): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  public static create(): UserId {
    return new UserId();
  }

  public static fromString(id: string): UserId {
    return new UserId(id);
  }
}
