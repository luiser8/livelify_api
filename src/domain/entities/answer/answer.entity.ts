import { AnswerId } from '../../value-objects/answer/answer-id.value-object';
import { UserId } from '../../value-objects/user/user-id.value-object';
import { QuestionId } from '../../value-objects/question/question-id.value-object';
import { LifeWheelAreaId } from '../../value-objects/lifewheel/lifewheel-area-id.value-object';

export interface AnswerProps {
  id?: AnswerId;
  value: boolean; // Sí = true, No = false
  userId: UserId;
  questionId: QuestionId;
  lifeWheelAreaId: LifeWheelAreaId;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Answer {
  private readonly _id: AnswerId;
  private _value: boolean;
  private readonly _userId: UserId;
  private readonly _questionId: QuestionId;
  private readonly _lifeWheelAreaId: LifeWheelAreaId;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: AnswerProps) {
    this._id = props.id || AnswerId.create();
    this._value = props.value;
    this._userId = props.userId;
    this._questionId = props.questionId;
    this._lifeWheelAreaId = props.lifeWheelAreaId;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  // ==========
  // Getters
  // ==========
  public get id(): AnswerId {
    return this._id;
  }

  public get value(): boolean {
    return this._value;
  }

  public get userId(): UserId {
    return this._userId;
  }

  public get questionId(): QuestionId {
    return this._questionId;
  }

  public get lifeWheelAreaId(): LifeWheelAreaId {
    return this._lifeWheelAreaId;
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
  public updateValue(newValue: boolean): void {
    this._value = newValue;
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  // ==========
  // Factory Methods
  // ==========
  public static create(
    value: boolean,
    userId: UserId,
    questionId: QuestionId,
    lifeWheelAreaId: LifeWheelAreaId,
  ): Answer {
    return new Answer({
      value,
      userId,
      questionId,
      lifeWheelAreaId,
    });
  }

  public static reconstitute(props: AnswerProps): Answer {
    return new Answer(props);
  }

  // ==========
  // Serialization
  // ==========
  public toPlainObject(): {
    id: string;
    value: boolean;
    userId: string;
    questionId: string;
    lifeWheelAreaId: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this._id.getValue(),
      value: this._value,
      userId: this._userId.getValue(),
      questionId: this._questionId.getValue(),
      lifeWheelAreaId: this._lifeWheelAreaId.getValue(),
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
