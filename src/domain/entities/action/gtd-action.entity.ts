import { GtdActionId } from '../../value-objects/action/gtd-action-id.value-object';
import { ProjectGoalId } from '../../value-objects/goal/project-goal-id.value-object';
import { ContextId } from '../../value-objects/context/context-id.value-object';
import { Context } from '../context/context.entity';

export enum EnergyLevel {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export interface GtdActionProps {
  id: GtdActionId;
  goalId: ProjectGoalId;
  contextId?: ContextId;
  context?: Context;
  title: string;
  description?: string;
  energy: EnergyLevel;
  timeEstimate?: number; // in minutes
  dueDate?: Date;
  completed: boolean;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class GtdAction {
  private readonly _id: GtdActionId;
  private readonly _goalId: ProjectGoalId;
  private _contextId?: ContextId;
  private readonly _context?: Context;
  private _title: string;
  private _description?: string;
  private _energy: EnergyLevel;
  private _timeEstimate?: number;
  private _dueDate?: Date;
  private _completed: boolean;
  private _completedAt?: Date;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: GtdActionProps) {
    this._id = props.id;
    this._goalId = props.goalId;
    this._contextId = props.contextId;
    this._context = props.context;
    this._title = props.title;
    this._description = props.description;
    this._energy = props.energy;
    this._timeEstimate = props.timeEstimate;
    this._dueDate = props.dueDate;
    this._completed = props.completed;
    this._completedAt = props.completedAt;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();

    this.validate();
  }

  public static create(
    goalId: ProjectGoalId,
    title: string,
    energy: EnergyLevel,
    contextId?: ContextId,
    context?: Context,
    description?: string,
    timeEstimate?: number,
    dueDate?: Date,
  ): GtdAction {
    return new GtdAction({
      id: GtdActionId.create(),
      goalId,
      contextId,
      context,
      title,
      description,
      energy,
      timeEstimate,
      dueDate,
      completed: false,
    });
  }

  public static reconstitute(props: GtdActionProps): GtdAction {
    return new GtdAction(props);
  }

  private validate(): void {
    if (!this._title || this._title.trim().length === 0) {
      throw new Error('Action title cannot be empty');
    }
    if (this._title.length > 200) {
      throw new Error('Action title cannot exceed 200 characters');
    }
    if (this._description && this._description.length > 1000) {
      throw new Error('Action description cannot exceed 1000 characters');
    }
    if (this._timeEstimate !== undefined && this._timeEstimate <= 0) {
      throw new Error('Time estimate must be positive');
    }
    if (!Object.values(EnergyLevel).includes(this._energy)) {
      throw new Error('Invalid energy level');
    }
    if (this._completed && !this._completedAt) {
      this._completedAt = new Date();
    }
    if (!this._completed && this._completedAt) {
      this._completedAt = undefined;
    }
  }

  // Business methods
  public updateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Action title cannot be empty');
    }
    if (title.length > 200) {
      throw new Error('Action title cannot exceed 200 characters');
    }

    this._title = title.trim();
    this.touch();
  }

  public updateDescription(description?: string): void {
    if (description && description.length > 1000) {
      throw new Error('Action description cannot exceed 1000 characters');
    }

    this._description = description?.trim() || undefined;
    this.touch();
  }

  public updateEnergy(energy: EnergyLevel): void {
    if (!Object.values(EnergyLevel).includes(energy)) {
      throw new Error('Invalid energy level');
    }

    this._energy = energy;
    this.touch();
  }

  public updateTimeEstimate(timeEstimate?: number): void {
    if (timeEstimate !== undefined && timeEstimate <= 0) {
      throw new Error('Time estimate must be positive');
    }

    this._timeEstimate = timeEstimate;
    this.touch();
  }

  public updateDueDate(dueDate?: Date): void {
    this._dueDate = dueDate;
    this.touch();
  }

  public updateContext(contextId?: ContextId): void {
    this._contextId = contextId;
    this.touch();
  }

  public markAsCompleted(): void {
    if (this._completed) {
      return; // Already completed
    }

    this._completed = true;
    this._completedAt = new Date();
    this.touch();
  }

  public markAsIncomplete(): void {
    if (!this._completed) {
      return; // Already incomplete
    }

    this._completed = false;
    this._completedAt = undefined;
    this.touch();
  }

  public isOverdue(): boolean {
    if (!this._dueDate || this._completed) {
      return false;
    }
    return this._dueDate < new Date();
  }

  public getDaysUntilDue(): number | null {
    if (!this._dueDate) {
      return null;
    }
    const now = new Date();
    const diffTime = this._dueDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Getters
  public get id(): GtdActionId {
    return this._id;
  }

  public get goalId(): ProjectGoalId {
    return this._goalId;
  }

  public get contextId(): ContextId | undefined {
    return this._contextId;
  }

  public get context(): Context | undefined {
    return this._context;
  }

  public get contextName(): string {
    return this._context?.name || 'No Context';
  }

  public get title(): string {
    return this._title;
  }

  public get description(): string | undefined {
    return this._description;
  }

  public get energy(): EnergyLevel {
    return this._energy;
  }

  public get timeEstimate(): number | undefined {
    return this._timeEstimate;
  }

  public get dueDate(): Date | undefined {
    return this._dueDate;
  }

  public get completed(): boolean {
    return this._completed;
  }

  public get completedAt(): Date | undefined {
    return this._completedAt;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  private touch(): void {
    this._updatedAt = new Date();
  }
}
