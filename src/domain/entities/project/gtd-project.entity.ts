import { GtdProjectId } from '../../value-objects/project/gtd-project-id.value-object';
import { LifeWheelAreaId } from '../../value-objects/lifewheel/lifewheel-area-id.value-object';

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  SOMEDAY = 'SOMEDAY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface GtdProjectProps {
  id?: GtdProjectId;
  lifeWheelAreaId: LifeWheelAreaId;
  title: string;
  description?: string;
  status?: ProjectStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class GtdProject {
  detailId(detailId: any) {
    throw new Error('Method not implemented.');
  }
  private readonly _id: GtdProjectId;
  private readonly _lifeWheelAreaId: LifeWheelAreaId;
  private _title: string;
  private _description?: string;
  private _status: ProjectStatus;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: GtdProjectProps) {
    this._id = props.id || GtdProjectId.create();
    this._lifeWheelAreaId = props.lifeWheelAreaId;
    this._title = props.title;
    this._description = props.description;
    this._status = props.status || ProjectStatus.ACTIVE;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  // ==========
  // Getters
  // ==========
  public get id(): GtdProjectId {
    return this._id;
  }

  public get lifeWheelAreaId(): LifeWheelAreaId {
    return this._lifeWheelAreaId;
  }

  public get title(): string {
    return this._title;
  }

  public get description(): string | undefined {
    return this._description;
  }

  public get status(): ProjectStatus {
    return this._status;
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
  public updateTitle(newTitle: string): void {
    if (!newTitle || newTitle.trim().length === 0) {
      throw new Error('Project title cannot be empty');
    }
    this._title = newTitle.trim();
    this.touch();
  }

  public updateDescription(newDescription?: string): void {
    this._description = newDescription?.trim();
    this.touch();
  }

  public updateStatus(newStatus: ProjectStatus): void {
    this._status = newStatus;
    this.touch();
  }

  public markAsCompleted(): void {
    this._status = ProjectStatus.COMPLETED;
    this.touch();
  }

  public markAsCancelled(): void {
    this._status = ProjectStatus.CANCELLED;
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  // ==========
  // Factory Methods
  // ==========
  public static create(
    lifeWheelAreaId: LifeWheelAreaId,
    title: string,
    description?: string,
  ): GtdProject {
    return new GtdProject({
      lifeWheelAreaId,
      title,
      description,
      status: ProjectStatus.ACTIVE,
    });
  }

  public static reconstitute(props: GtdProjectProps): GtdProject {
    return new GtdProject(props);
  }

  // ==========
  // Serialization
  // ==========
  public toPlainObject(): {
    id: string;
    lifeWheelAreaId: string;
    title: string;
    description?: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this._id.getValue(),
      lifeWheelAreaId: this._lifeWheelAreaId.getValue(),
      title: this._title,
      description: this._description,
      status: this._status,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
