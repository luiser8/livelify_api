import { UserSubscriptionId } from '../../value-objects/subscription/user-subscription-id.value-object';
import { UserId } from '../../value-objects/user/user-id.value-object';
import { SubscriptionPlanId } from '../../value-objects/subscription/subscription-plan-id.value-object';
import { SubscriptionPlan } from '../subscription/subscription-plan.entity';

export interface UserSubscriptionProps {
  id?: UserSubscriptionId;
  userId: UserId;
  planId: SubscriptionPlanId;
  plan?: SubscriptionPlan;
  startDate?: Date;
  renewalDate?: Date;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserSubscription {
  private readonly _id: UserSubscriptionId;
  private readonly _userId: UserId;
  private readonly _planId: SubscriptionPlanId;
  private readonly _startDate: Date;
  private _renewalDate: Date;
  private _active: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  _plan: SubscriptionPlan;

  constructor(props: UserSubscriptionProps) {
    this._id = props.id || UserSubscriptionId.create();
    this._userId = props.userId;
    this._planId = props.planId;
    this._startDate = props.startDate || new Date();
    this._renewalDate = props.renewalDate || new Date();
    this._active = props.active ?? true;
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

  public get plan(): SubscriptionPlan {
    return this._plan;
  }

  public get startDate(): Date {
    return this._startDate;
  }

  public get renewalDate(): Date {
    return this._renewalDate;
  }

  public get active(): boolean {
    return this._active;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  // Business methods
  public renew(newRenewalDate: Date): void {
    this._renewalDate = newRenewalDate;
    this._active = true;
    this.touch();
  }

  public cancel(): void {
    this._active = false;
    this.touch();
  }

  public changePlan(newPlan: SubscriptionPlan): void {
    this._plan = newPlan;
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  // Factory methods
  public static create(
    props: Omit<
      UserSubscriptionProps,
      'id' | 'startDate' | 'active' | 'createdAt' | 'updatedAt'
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
      //plan: this._plan.toPlainObject(),
      startDate: this._startDate,
      renewalDate: this._renewalDate,
      active: this._active,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
