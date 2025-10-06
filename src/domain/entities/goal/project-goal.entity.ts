import { ProjectGoalId } from '../../value-objects/goal/project-goal-id.value-object';
import { GtdProjectDetailId } from '../../value-objects/project/gtd-project-detail-id.value-object';

export enum GoalType {
  BE = 'BE',
  DO = 'DO',
  HAVE = 'HAVE',
}

export interface ProjectGoalProps {
  id: ProjectGoalId;
  detailId: GtdProjectDetailId;
  goalType: GoalType;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ProjectGoal {
  private readonly _id: ProjectGoalId;
  private readonly _detailId: GtdProjectDetailId;
  private readonly _goalType: GoalType;
  private _content: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: ProjectGoalProps) {
    this._id = props.id;
    this._detailId = props.detailId;
    this._goalType = props.goalType;
    this._content = props.content;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();

    this.validate();
  }

  public static create(
    detailId: GtdProjectDetailId,
    goalType: GoalType,
    content: string,
  ): ProjectGoal {
    return new ProjectGoal({
      id: ProjectGoalId.create(),
      detailId,
      goalType,
      content,
    });
  }

  public static reconstitute(props: ProjectGoalProps): ProjectGoal {
    return new ProjectGoal(props);
  }

  private validate(): void {
    if (!this._content || this._content.trim().length === 0) {
      throw new Error('Goal content cannot be empty');
    }
    if (this._content.length > 500) {
      throw new Error('Goal content cannot exceed 500 characters');
    }
    if (!Object.values(GoalType).includes(this._goalType)) {
      throw new Error('Invalid goal type');
    }
  }

  // Business methods
  public updateContent(content: string): void {
    if (!content || content.trim().length === 0) {
      throw new Error('Goal content cannot be empty');
    }
    if (content.length > 500) {
      throw new Error('Goal content cannot exceed 500 characters');
    }

    this._content = content.trim();
    this.touch();
  }

  // Getters
  public get id(): ProjectGoalId {
    return this._id;
  }

  public get detailId(): GtdProjectDetailId {
    return this._detailId;
  }

  public get goalType(): GoalType {
    return this._goalType;
  }

  public get content(): string {
    return this._content;
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
