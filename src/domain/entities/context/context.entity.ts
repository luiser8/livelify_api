import { ContextId } from '../../value-objects/context/context-id.value-object';
import { UserId } from '../../value-objects/user/user-id.value-object';

export interface ContextProps {
  id: ContextId;
  userId: UserId;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Context {
  private readonly _id: ContextId;
  private readonly _userId: UserId;
  private _name: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: ContextProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._name = props.name;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();

    this.validate();
  }

  public static create(userId: UserId, name: string): Context {
    return new Context({
      id: ContextId.create(),
      userId,
      name,
    });
  }

  public static reconstitute(props: ContextProps): Context {
    return new Context(props);
  }

  private validate(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new Error('Context name cannot be empty');
    }
    if (this._name.length > 100) {
      throw new Error('Context name cannot exceed 100 characters');
    }
  }

  // Business methods
  public updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Context name cannot be empty');
    }
    if (name.length > 100) {
      throw new Error('Context name cannot exceed 100 characters');
    }

    this._name = name.trim();
    this.touch();
  }

  // Getters
  public get id(): ContextId {
    return this._id;
  }

  public get userId(): UserId {
    return this._userId;
  }

  public get name(): string {
    return this._name;
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
