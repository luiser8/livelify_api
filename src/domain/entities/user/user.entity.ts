import { UserId } from '../../value-objects/user/user-id.value-object';
import { Email } from '../../value-objects/user/email.value-object';
import { Password } from '../../value-objects/user/password.value-object';
import { UserProfile } from '../user/user-profile.entity';
import { SubscriptionPlan } from '../subscription/subscription-plan.entity';

export interface UserProps {
  id?: UserId;
  email: Email;
  password: Password;
  currencyId?: string;
  profile?: UserProfile;
  plan?: SubscriptionPlan;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  private readonly _id: UserId;
  private _email: Email;
  private _password: Password;
  private _currencyId?: string;
  private _profile?: UserProfile;
  private _plan?: SubscriptionPlan;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: UserProps) {
    this._id = props.id || UserId.create();
    this._email = props.email;
    this._password = props.password;
    this._currencyId = props.currencyId;
    this._profile = props.profile;
    this._plan = props.plan;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  // Getters
  public get id(): UserId {
    return this._id;
  }

  public get email(): Email {
    return this._email;
  }

  public get password(): Password {
    return this._password;
  }

  public get currencyId(): string | undefined {
    return this._currencyId;
  }

  public get profile(): UserProfile | undefined {
    return this._profile;
  }

  public get plan(): SubscriptionPlan | undefined {
    return this._plan;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  // Business methods
  public changeEmail(newEmail: Email): void {
    this._email = newEmail;
    this.touch();
  }

  public async changePassword(newPassword: Password): Promise<void> {
    this._password = await newPassword.hash();
    this.touch();
  }

  public async validatePassword(plainPassword: string): Promise<boolean> {
    return this._password.compare(plainPassword);
  }

  public updateProfile(profile: UserProfile): void {
    this._profile = profile;
    this.touch();
  }

  public updateCurrency(currencyId: string): void {
    this._currencyId = currencyId;
    this.touch();
  }

  public hasProfile(): boolean {
    return this._profile !== undefined;
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  // Factory methods
  public static async create(
    email: string,
    plainPassword: string,
  ): Promise<User> {
    const emailVO = new Email(email);
    const passwordVO = new Password(plainPassword);
    const hashedPassword = await passwordVO.hash();

    return new User({
      email: emailVO,
      password: hashedPassword,
    });
  }

  public static reconstitute(props: UserProps): User {
    return new User(props);
  }

  // Conversion methods
  public toPlainObject() {
    return {
      id: this._id.getValue(),
      email: this._email.getValue(),
      password: this._password.getValue(),
      currencyId: this._currencyId,
      profile: this._profile?.toPlainObject(),
      plan: this._plan ? this._plan.toPlainObject() : null,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
