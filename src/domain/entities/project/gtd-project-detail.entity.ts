import { GtdProjectDetailId } from '../../value-objects/project/gtd-project-detail-id.value-object';
import { GtdProjectId } from '../../value-objects/project/gtd-project-id.value-object';
import { AreaId } from '../../value-objects/area/area-id.value-object';

export enum ProjectDetailStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

export interface GtdProjectDetailProps {
  id?: GtdProjectDetailId;
  projectId: GtdProjectId;
  lifeAreaId: AreaId;
  status?: ProjectDetailStatus;
  startDate: Date;
  endDate: Date;
  completedActions?: number;
  totalActions?: number;
  progressPercentage?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class GtdProjectDetail {
  private readonly _id: GtdProjectDetailId;
  private readonly _projectId: GtdProjectId;
  private readonly _lifeAreaId: AreaId;
  private _status: ProjectDetailStatus;
  private _startDate: Date;
  private _endDate: Date;
  private _completedActions: number;
  private _totalActions: number;
  private _progressPercentage: number;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: GtdProjectDetailProps) {
    this._id = props.id || GtdProjectDetailId.create();
    this._projectId = props.projectId;
    this._lifeAreaId = props.lifeAreaId;
    this._status = props.status || ProjectDetailStatus.PLANNING;
    this._startDate = props.startDate;
    this._endDate = props.endDate;
    this._completedActions = props.completedActions || 0;
    this._totalActions = props.totalActions || 0;
    this._progressPercentage = props.progressPercentage || 0;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  // ==========
  // Getters
  // ==========
  public get id(): GtdProjectDetailId {
    return this._id;
  }

  public get projectId(): GtdProjectId {
    return this._projectId;
  }

  public get lifeAreaId(): AreaId {
    return this._lifeAreaId;
  }

  public get status(): ProjectDetailStatus {
    return this._status;
  }

  public get startDate(): Date {
    return this._startDate;
  }

  public get endDate(): Date {
    return this._endDate;
  }

  public get completedActions(): number {
    return this._completedActions;
  }

  public get totalActions(): number {
    return this._totalActions;
  }

  public get progressPercentage(): number {
    return this._progressPercentage;
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
  public updateStatus(newStatus: ProjectDetailStatus): void {
    this._status = newStatus;
    this.touch();
  }

  public updateDates(startDate: Date, endDate: Date): void {
    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }
    this._startDate = startDate;
    this._endDate = endDate;
    this.touch();
  }

  public updateActionCounts(
    completedActions: number,
    totalActions: number,
  ): void {
    if (completedActions < 0 || totalActions < 0) {
      throw new Error('Action counts cannot be negative');
    }
    if (completedActions > totalActions) {
      throw new Error('Completed actions cannot exceed total actions');
    }

    this._completedActions = completedActions;
    this._totalActions = totalActions;
    this._progressPercentage =
      totalActions > 0 ? (completedActions / totalActions) * 100 : 0;
    this.touch();
  }

  public addAction(): void {
    this._totalActions += 1;
    this.recalculateProgress();
    this.touch();
  }

  public completeAction(): void {
    if (this._completedActions < this._totalActions) {
      this._completedActions += 1;
      this.recalculateProgress();
      this.touch();
    }
  }

  public uncompleteAction(): void {
    if (this._completedActions > 0) {
      this._completedActions -= 1;
      this.recalculateProgress();
      this.touch();
    }
  }

  private recalculateProgress(): void {
    this._progressPercentage =
      this._totalActions > 0
        ? (this._completedActions / this._totalActions) * 100
        : 0;
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  // ==========
  // Factory Methods
  // ==========
  public static create(
    projectId: GtdProjectId,
    lifeAreaId: AreaId,
    startDate: Date,
    endDate: Date,
  ): GtdProjectDetail {
    return new GtdProjectDetail({
      projectId,
      lifeAreaId,
      startDate,
      endDate,
      status: ProjectDetailStatus.ACTIVE,
    });
  }

  public static reconstitute(props: GtdProjectDetailProps): GtdProjectDetail {
    return new GtdProjectDetail(props);
  }

  // ==========
  // Business methods
  // ==========
  /**
   * Actualiza el progreso del proyecto
   */
  public updateProgress(
    totalActions: number,
    completedActions: number,
    progressPercentage: number,
  ): void {
    if (totalActions < 0 || completedActions < 0) {
      throw new Error('Actions count cannot be negative');
    }
    if (completedActions > totalActions) {
      throw new Error('Completed actions cannot exceed total actions');
    }
    if (progressPercentage < 0 || progressPercentage > 100) {
      throw new Error('Progress percentage must be between 0 and 100');
    }

    this._totalActions = totalActions;
    this._completedActions = completedActions;
    this._progressPercentage = progressPercentage;
    this.touch();
  }

  // ==========
  // Serialization
  // ==========
  public toPlainObject(): {
    id: string;
    projectId: string;
    lifeAreaId: string;
    status: string;
    startDate: Date;
    endDate: Date;
    completedActions: number;
    totalActions: number;
    progressPercentage: number;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this._id.getValue(),
      projectId: this._projectId.getValue(),
      lifeAreaId: this._lifeAreaId.getValue(),
      status: this._status,
      startDate: this._startDate,
      endDate: this._endDate,
      completedActions: this._completedActions,
      totalActions: this._totalActions,
      progressPercentage: this._progressPercentage,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
