import { LifeWheelAreaId } from '../../value-objects/lifewheel/lifewheel-area-id.value-object';
import { LifeWheelId } from '../../value-objects/lifewheel/lifewheel-id.value-object';
import { AreaId } from '../../value-objects/area/area-id.value-object';
import { Area } from '../area/area.entity';

export interface LifeWheelAreaProps {
  id?: LifeWheelAreaId;
  lifeWheelId: LifeWheelId;
  areaId: AreaId;
  area?: Area; // Referencia completa al área
  score?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class LifeWheelArea {
  private readonly _id: LifeWheelAreaId;
  private readonly _lifeWheelId: LifeWheelId;
  private readonly _areaId: AreaId;
  private readonly _area?: Area; // Referencia completa al área
  private _score: number;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: LifeWheelAreaProps) {
    this._id = props.id || LifeWheelAreaId.create();
    this._lifeWheelId = props.lifeWheelId;
    this._areaId = props.areaId;
    this._area = props.area;
    this._score = props.score || 0;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  // ==========
  // Getters
  // ==========
  public get id(): LifeWheelAreaId {
    return this._id;
  }

  public get lifeWheelId(): LifeWheelId {
    return this._lifeWheelId;
  }

  public get areaId(): AreaId {
    return this._areaId;
  }

  public get area(): Area | undefined {
    return this._area;
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

  // ==========
  // Business Methods
  // ==========
  public updateScore(newScore: number): void {
    this.validateScore(newScore);
    this._score = newScore;
    this.touch();
  }

  private validateScore(score: number): void {
    if (score < 0 || score > 10) {
      throw new Error('Score must be between 0 and 10');
    }
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  // ==========
  // Factory Methods
  // ==========
  public static create(
    lifeWheelId: LifeWheelId,
    areaId: AreaId,
    area?: Area,
    initialScore = 0,
  ): LifeWheelArea {
    return new LifeWheelArea({
      lifeWheelId,
      areaId,
      area,
      score: initialScore,
    });
  }

  public static reconstitute(props: LifeWheelAreaProps): LifeWheelArea {
    return new LifeWheelArea(props);
  }

  // ==========
  // Serialization
  // ==========
  public toPlainObject(): {
    id: string;
    lifeWheelId: string;
    areaId: string;
    score: number;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this._id.getValue(),
      lifeWheelId: this._lifeWheelId.getValue(),
      areaId: this._areaId.getValue(),
      score: this._score,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
