import { UserId } from '../../value-objects/user/user-id.value-object';
import { randomBytes } from 'crypto';

export enum RecoveryType {
  REGISTER = 'REGISTER',
  RECOVER_PASSWORD = 'RECOVER_PASSWORD',
  RECOVER_EMAIL = 'RECOVER_EMAIL',
}

export interface UserRecoveryProps {
  id?: string;
  userId: UserId;
  type: RecoveryType;
  urlHash?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserRecovery {
  private readonly _id: string;
  private readonly _userId: UserId;
  private _type: RecoveryType;
  private _urlHash?: string;
  private _active: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: UserRecoveryProps) {
    this._id = props.id || this.generateId();
    this._userId = props.userId;
    this._type = props.type;
    this._urlHash = props.urlHash;
    this._active = props.active ?? true;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  // Getters
  public get id(): string {
    return this._id;
  }

  public get userId(): UserId {
    return this._userId;
  }

  public get type(): RecoveryType {
    return this._type;
  }

  public get urlHash(): string | undefined {
    return this._urlHash;
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
  public deactivate(): void {
    this._active = false;
    this.touch();
  }

  public activate(): void {
    this._active = true;
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  private generateId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  // Factory method for account activation
  public static createForActivation(
    userId: UserId,
    urlHash: string,
  ): UserRecovery {
    return new UserRecovery({
      userId,
      type: RecoveryType.REGISTER,
      urlHash,
      active: true,
    });
  }

  public static generateActivationHash(): string {
    return randomBytes(32).toString('hex');
  }

  // Factory method for password recovery
  public static createForPasswordRecovery(userId: UserId): UserRecovery {
    return new UserRecovery({
      userId,
      type: RecoveryType.RECOVER_PASSWORD,
      active: true,
    });
  }

  public static reconstitute(props: UserRecoveryProps): UserRecovery {
    return new UserRecovery(props);
  }

  // Conversion methods
  public toPlainObject() {
    return {
      id: this._id,
      userId: this._userId.getValue(),
      type: this._type,
      urlHash: this._urlHash,
      active: this._active,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
