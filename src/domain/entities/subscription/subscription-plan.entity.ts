/* eslint-disable @typescript-eslint/no-explicit-any */

import { SubscriptionPlanId } from '../../value-objects/subscription/subscription-plan-id.value-object';
import { PlanType } from '@prisma/client';

export interface SubscriptionPlanProps {
  id?: SubscriptionPlanId;
  name: PlanType;
  description?: string;
  
  // Precios base y calculados
  basePrice: number; // Precio base del período
  pricePerMonth: number; // Precio calculado por mes
  savings?: number; // Ahorro comparado con mensual
  discount?: number; // Porcentaje de descuento

  // Metadatos del plan
  billingCycle: number; // Duración en meses (1, 3, 6, 12)
  bestFor: string; // "Mensual", "Trimestral", "Semestral", "Anual"
  
  features: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SubscriptionPlan {
  private readonly _id: SubscriptionPlanId;
  private _name: PlanType;
  private _description?: string;
  
  // Precios
  private _basePrice: number;
  private _pricePerMonth: number;
  private _savings?: number;
  private _discount?: number;
  
  // Metadatos
  private _billingCycle: number;
  private _bestFor: string;
  
  private _features: Record<string, any>;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: SubscriptionPlanProps) {
    this._id = props.id || SubscriptionPlanId.create();
    this._name = props.name;
    this._description = props.description;
    
    this._basePrice = props.basePrice;
    this._pricePerMonth = props.pricePerMonth;
    this._savings = props.savings;
    this._discount = props.discount;
    
    this._billingCycle = props.billingCycle;
    this._bestFor = props.bestFor;
    
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

  public get basePrice(): number {
    return this._basePrice;
  }

  public get pricePerMonth(): number {
    return this._pricePerMonth;
  }

  public get savings(): number | undefined {
    return this._savings;
  }

  public get discount(): number | undefined {
    return this._discount;
  }

  public get billingCycle(): number {
    return this._billingCycle;
  }

  public get bestFor(): string {
    return this._bestFor;
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
  public updatePrice(basePrice: number, pricePerMonth: number): void {
    this._basePrice = basePrice;
    this._pricePerMonth = pricePerMonth;
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

  public updateSavings(savings: number): void {
    this._savings = savings;
    this.touch();
  }

  public updateDiscount(discount: number): void {
    this._discount = discount;
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
      basePrice: this._basePrice,
      pricePerMonth: this._pricePerMonth,
      savings: this._savings,
      discount: this._discount,
      billingCycle: this._billingCycle,
      bestFor: this._bestFor,
      features: this._features,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
