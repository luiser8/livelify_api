import { randomUUID } from 'crypto';

export class UserSubscriptionId {
  private readonly value: string;

  constructor(id?: string) {
    this.value = id || randomUUID();
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: UserSubscriptionId): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  public static create(): UserSubscriptionId {
    return new UserSubscriptionId();
  }

  public static fromString(id: string): UserSubscriptionId {
    return new UserSubscriptionId(id);
  }
}
