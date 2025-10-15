import { UserId } from '../../value-objects/user/user-id.value-object';
import { LifeWheelId } from '../../value-objects/lifewheel/lifewheel-id.value-object';
import { AreaId } from '../../value-objects/area/area-id.value-object';

export interface UserAreasSelectedProps {
  id?: string;
  userId: UserId;
  lifeWheelId: LifeWheelId;
  areaId: AreaId;
  score: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserAreasSelected {
  private readonly _id: string;
  private readonly _userId: UserId;
  private readonly _lifeWheelId: LifeWheelId;
  private readonly _areaId: AreaId;
  private _score: number;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: UserAreasSelectedProps) {
    this._id = props.id || crypto.randomUUID();
    this._userId = props.userId;
    this._lifeWheelId = props.lifeWheelId;
    this._areaId = props.areaId;
    this._score = props.score;
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

  public get lifeWheelId(): LifeWheelId {
    return this._lifeWheelId;
  }

  public get areaId(): AreaId {
    return this._areaId;
  }

  public get score(): number {
    return this._score;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  // Additional getter methods for compatibility
  public getId(): string {
    return this._id;
  }

  public getUserId(): UserId {
    return this._userId;
  }

  public getLifeWheelId(): LifeWheelId {
    return this._lifeWheelId;
  }

  public getAreaId(): AreaId {
    return this._areaId;
  }

  public getScore(): number {
    return this._score;
  }

  public getCreatedAt(): Date {
    return this._createdAt;
  }

  public getUpdatedAt(): Date {
    return this._updatedAt;
  }

  // Business methods
  public updateScore(newScore: number): void {
    if (newScore < 0 || newScore > 10) {
      throw new Error('Score must be between 0 and 10');
    }
    this._score = newScore;
    this.touch();
  }

  public incrementScore(amount: number = 1): void {
    const newScore = this._score + amount;
    if (newScore > 10) {
      throw new Error('Score cannot exceed 10');
    }
    this._score = newScore;
    this.touch();
  }

  public decrementScore(amount: number = 1): void {
    const newScore = this._score - amount;
    if (newScore < 0) {
      throw new Error('Score cannot be less than 0');
    }
    this._score = newScore;
    this.touch();
  }

  public resetScore(): void {
    this._score = 0;
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  // Validation methods
  public isValid(): boolean {
    return this._score >= 0 && this._score <= 10;
  }

  public isHighPriority(): boolean {
    return this._score <= 3;
  }

  public isMediumPriority(): boolean {
    return this._score > 3 && this._score <= 7;
  }

  public isLowPriority(): boolean {
    return this._score > 7;
  }

  // Factory methods
  public static create(
    props: Omit<UserAreasSelectedProps, 'id' | 'createdAt' | 'updatedAt'>,
  ): UserAreasSelected {
    if (props.score < 0 || props.score > 10) {
      throw new Error('Score must be between 0 and 10');
    }

    return new UserAreasSelected(props);
  }

  public static reconstitute(props: UserAreasSelectedProps): UserAreasSelected {
    return new UserAreasSelected(props);
  }

  // Conversion methods
  public toPlainObject() {
    return {
      id: this._id,
      userId: this._userId.getValue(),
      lifeWheelId: this._lifeWheelId.getValue(),
      areaId: this._areaId.getValue(),
      score: this._score,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  // Static methods for batch operations
  public static createMultiple(
    userId: UserId,
    lifeWheelId: LifeWheelId,
    areas: Array<{ areaId: AreaId; score: number }>,
  ): UserAreasSelected[] {
    return areas.map((area) =>
      UserAreasSelected.create({
        userId,
        lifeWheelId,
        areaId: area.areaId,
        score: area.score,
      }),
    );
  }
}
