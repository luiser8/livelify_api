import { UserId } from '../../value-objects/user/user-id.value-object';

export interface UserProfileProps {
  id?: string;
  userId: UserId;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  avatarUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserProfile {
  private readonly _id: string;
  private readonly _userId: UserId;
  private _firstName: string;
  private _lastName: string;
  private _address: string;
  private _phone: string;
  private _avatarUrl?: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: UserProfileProps) {
    this._id = props.id || crypto.randomUUID();
    this._userId = props.userId;
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._address = props.address;
    this._phone = props.phone;
    this._avatarUrl = props.avatarUrl;
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

  public get firstName(): string {
    return this._firstName;
  }

  public get lastName(): string {
    return this._lastName;
  }

  public get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  public get address(): string {
    return this._address;
  }

  public get phone(): string {
    return this._phone;
  }

  public get avatarUrl(): string | undefined {
    return this._avatarUrl;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  // Additional getter methods for compatibility
  public getFirstName(): string {
    return this._firstName;
  }

  public getLastName(): string {
    return this._lastName;
  }

  public getPhone(): string {
    return this._phone;
  }

  public getAddress(): string {
    return this._address;
  }

  public getAvatarUrl(): string | undefined {
    return this._avatarUrl;
  }

  public getId(): string {
    return this._id;
  }

  // Business methods
  public updatePersonalInfo(firstName: string, lastName: string): void {
    this._firstName = firstName;
    this._lastName = lastName;
    this.touch();
  }

  public updateContactInfo(address: string, phone: string): void {
    this._address = address;
    this._phone = phone;
    this.touch();
  }

  public updateAvatar(avatarUrl: string): void {
    this._avatarUrl = avatarUrl;
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  // Factory methods
  public static create(
    props: Omit<UserProfileProps, 'id' | 'createdAt' | 'updatedAt'>,
  ): UserProfile {
    return new UserProfile(props);
  }

  public static reconstitute(props: UserProfileProps): UserProfile {
    return new UserProfile(props);
  }

  // Conversion methods
  public toPlainObject() {
    return {
      id: this._id,
      userId: this._userId.getValue(),
      firstName: this._firstName,
      lastName: this._lastName,
      address: this._address,
      phone: this._phone,
      avatarUrl: this._avatarUrl,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
