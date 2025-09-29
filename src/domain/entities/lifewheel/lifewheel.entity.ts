import { LifeWheelId } from '../../value-objects/lifewheel/lifewheel-id.value-object';
import { UserId } from '../../value-objects/user/user-id.value-object';
import { LifeWheelArea } from './lifewheel-area.entity';

export interface LifeWheelProps {
  id?: LifeWheelId;
  userId: UserId;
  lifeAreas?: LifeWheelArea[];
  globalScore?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class LifeWheel {
  private readonly _id: LifeWheelId;
  private readonly _userId: UserId;
  private _lifeAreas: LifeWheelArea[];
  private _globalScore: number;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: LifeWheelProps) {
    this._id = props.id || LifeWheelId.create();
    this._userId = props.userId;
    this._lifeAreas = props.lifeAreas || [];
    this._globalScore = props.globalScore || 0;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  // ==========
  // Getters
  // ==========
  public get id(): LifeWheelId {
    return this._id;
  }

  public get userId(): UserId {
    return this._userId;
  }

  public get lifeAreas(): LifeWheelArea[] {
    return this._lifeAreas;
  }

  public get globalScore(): number {
    return this._globalScore;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  // ==========
  // Business Methods
  // ==========
  public addLifeArea(lifeArea: LifeWheelArea): void {
    this._lifeAreas.push(lifeArea);
    this.recalculateGlobalScore();
    this.touch();
  }

  public updateLifeArea(lifeAreaId: string, newScore: number): void {
    const lifeArea = this._lifeAreas.find(
      (area) => area.id.getValue() === lifeAreaId,
    );
    if (lifeArea) {
      lifeArea.updateScore(newScore);
      this.recalculateGlobalScore();
      this.touch();
    }
  }

  private recalculateGlobalScore(): void {
    if (this._lifeAreas.length === 0) {
      this._globalScore = 0;
      return;
    }

    const totalScore = this._lifeAreas.reduce(
      (sum, area) => sum + area.score,
      0,
    );
    this._globalScore = totalScore / this._lifeAreas.length;
  }

  public updateGlobalScore(newGlobalScore: number): void {
    this._globalScore = newGlobalScore;
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  // ==========
  // Factory Methods
  // ==========
  public static create(userId: UserId): LifeWheel {
    return new LifeWheel({
      userId,
      globalScore: 0,
    });
  }

  public static reconstitute(props: LifeWheelProps): LifeWheel {
    return new LifeWheel(props);
  }

  // ==========
  // Serialization
  // ==========
  public toPlainObject(): {
    id: string;
    userId: string;
    globalScore: number;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this._id.getValue(),
      userId: this._userId.getValue(),
      globalScore: this._globalScore,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
