import { randomUUID } from 'crypto';

export class SubscriptionPlanId {
  private readonly value: string;

  constructor(id?: string) {
    this.value = id || randomUUID();
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: SubscriptionPlanId): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  public static create(id?: SubscriptionPlanId): SubscriptionPlanId {
    return new SubscriptionPlanId();
  }

  public static fromString(id: string): SubscriptionPlanId {
    return new SubscriptionPlanId(id);
  }
}
