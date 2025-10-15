import { UserSubscriptionId } from '../../value-objects/subscription/user-subscription-id.value-object';
import { UserId } from '../../value-objects/user/user-id.value-object';
import { SubscriptionPlanId } from '../../value-objects/subscription/subscription-plan-id.value-object';
import { SubscriptionPlan } from '../subscription/subscription-plan.entity';
import { PaymentMethod, PaymentProvider } from '@prisma/client';

export interface UserSubscriptionProps {
  id?: UserSubscriptionId;
  userId: UserId;
  planId: SubscriptionPlanId;
  plan?: SubscriptionPlan;
  
  currencyId: string; // ID de la moneda utilizada
  
  // Información de pago y estado
  startDate?: Date;
  endDate: Date; // Fecha de finalización
  renewalDate?: Date; // Próxima fecha de renovación
  active?: boolean;
  autoRenew?: boolean;
  
  // Información de transacción
  amountPaid?: number; // Monto realmente pagado
  paymentMethod?: PaymentMethod;
  paymentProvider?: PaymentProvider;
  
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserSubscription {
  private readonly _id: UserSubscriptionId;
  private readonly _userId: UserId;
  private readonly _planId: SubscriptionPlanId;
  _plan?: SubscriptionPlan;
  
  private _currencyId: string;
  
  // Fechas
  private readonly _startDate: Date;
  private _endDate: Date;
  private _renewalDate?: Date;
  
  // Estado
  private _active: boolean;
  private _autoRenew: boolean;
  
  // Pago
  private _amountPaid?: number;
  private _paymentMethod?: PaymentMethod;
  private _paymentProvider?: PaymentProvider;
  
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: UserSubscriptionProps) {
    this._id = props.id || UserSubscriptionId.create();
    this._userId = props.userId;
    this._planId = props.planId;
    this._plan = props.plan;
    
    this._currencyId = props.currencyId;
    
    this._startDate = props.startDate || new Date();
    this._endDate = props.endDate;
    this._renewalDate = props.renewalDate;
    
    this._active = props.active ?? true;
    this._autoRenew = props.autoRenew ?? true;
    
    this._amountPaid = props.amountPaid;
    this._paymentMethod = props.paymentMethod;
    this._paymentProvider = props.paymentProvider;
    
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  // Getters
  public get id(): UserSubscriptionId {
    return this._id;
  }

  public get userId(): UserId {
    return this._userId;
  }

  public get planId(): SubscriptionPlanId {
    return this._planId;
  }

  public get plan(): SubscriptionPlan | undefined {
    return this._plan;
  }

  public get currencyId(): string {
    return this._currencyId;
  }

  public get startDate(): Date {
    return this._startDate;
  }

  public get endDate(): Date {
    return this._endDate;
  }

  public get renewalDate(): Date | undefined {
    return this._renewalDate;
  }

  public get active(): boolean {
    return this._active;
  }

  public get autoRenew(): boolean {
    return this._autoRenew;
  }

  public get amountPaid(): number | undefined {
    return this._amountPaid;
  }

  public get paymentMethod(): PaymentMethod | undefined {
    return this._paymentMethod;
  }

  public get paymentProvider(): PaymentProvider | undefined {
    return this._paymentProvider;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  // Business methods
  public renew(newRenewalDate: Date, newEndDate: Date): void {
    this._renewalDate = newRenewalDate;
    this._endDate = newEndDate;
    this._active = true;
    this.touch();
  }

  public cancel(): void {
    this._active = false;
    this._autoRenew = false;
    this.touch();
  }

  public changePlan(newPlan: SubscriptionPlan): void {
    this._plan = newPlan;
    this.touch();
  }

  public toggleAutoRenew(): void {
    this._autoRenew = !this._autoRenew;
    this.touch();
  }

  public updatePaymentInfo(
    amountPaid: number,
    paymentMethod: PaymentMethod,
    paymentProvider: PaymentProvider,
  ): void {
    this._amountPaid = amountPaid;
    this._paymentMethod = paymentMethod;
    this._paymentProvider = paymentProvider;
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  // Factory methods
  public static create(
    props: Omit<
      UserSubscriptionProps,
      'id' | 'startDate' | 'active' | 'autoRenew' | 'createdAt' | 'updatedAt'
    >,
  ): UserSubscription {
    return new UserSubscription(props);
  }

  public static reconstitute(props: UserSubscriptionProps): UserSubscription {
    return new UserSubscription(props);
  }

  // Conversion methods
  public toPlainObject() {
    return {
      id: this._id.getValue(),
      userId: this._userId.getValue(),
      planId: this._planId.getValue(),
      plan: this._plan ? this._plan.toPlainObject() : undefined,
      currencyId: this._currencyId,
      startDate: this._startDate,
      endDate: this._endDate,
      renewalDate: this._renewalDate,
      active: this._active,
      autoRenew: this._autoRenew,
      amountPaid: this._amountPaid,
      paymentMethod: this._paymentMethod,
      paymentProvider: this._paymentProvider,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
