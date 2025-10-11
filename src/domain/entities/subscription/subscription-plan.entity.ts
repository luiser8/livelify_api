/* eslint-disable @typescript-eslint/no-explicit-any */

import { SubscriptionPlanId } from '../../value-objects/subscription/subscription-plan-id.value-object';
import { PlanType } from '@prisma/client';

export interface SubscriptionPlanProps {
  id?: SubscriptionPlanId;
  name: PlanType;
  description?: string;
  price: number;
  features: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SubscriptionPlan {
  private readonly _id: SubscriptionPlanId;
  private _name: PlanType;
  private _description?: string;
  private _price: number;
  private _features: Record<string, any>;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: SubscriptionPlanProps) {
    this._id = props.id || SubscriptionPlanId.create();
    this._name = props.name;
    this._description = props.description;
    this._price = props.price;
    this._features = props.features;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  // Getters
  public get id(): SubscriptionPlanId {
    return this._id;
  }

  public get name(): PlanType {
    return this._name;
  }

  public get description(): string | undefined {
    return this._description;
  }

  public get price(): number {
    return this._price;
  }

  public get features(): Record<string, any> {
    return this._features;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  // Business methods
  public updatePrice(newPrice: number): void {
    this._price = newPrice;
    this.touch();
  }

  public updateDescription(newDescription: string): void {
    this._description = newDescription;
    this.touch();
  }

  public updateFeatures(newFeatures: Record<string, any>): void {
    this._features = newFeatures;
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  // Factory methods
  public static create(
    props: Omit<SubscriptionPlanProps, 'id' | 'createdAt' | 'updatedAt'>,
  ): SubscriptionPlan {
    return new SubscriptionPlan(props);
  }

  public static reconstitute(props: SubscriptionPlanProps): SubscriptionPlan {
    return new SubscriptionPlan(props);
  }

  // Conversion methods
  public toPlainObject() {
    return {
      id: this._id.getValue(),
      name: this._name,
      description: this._description,
      price: this._price,
      features: this._features,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
