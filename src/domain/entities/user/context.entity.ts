import { ContextId } from '../../value-objects/context/context-id.value-object';
import { UserId } from '../../value-objects/user/user-id.value-object';
//import { GtdAction } from './gtd-action.entity';

interface GtdAction {
  id: string;
  title: string;
  description?: string;
  toPlainObject(): { id: string; title: string; description?: string };
}

export interface ContextProps {
  id?: ContextId;
  userId: UserId;
  name: string;
  actions?: GtdAction[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Context {
  private readonly _id: ContextId;
  private readonly _userId: UserId;
  private _name: string;
  private _actions: GtdAction[];
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: ContextProps) {
    this._id = props.id || ContextId.create();
    this._userId = props.userId;
    this._name = props.name;
    this._actions = props.actions || [];
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  // ==========
  // Getters
  // ==========
  public get id(): ContextId {
    return this._id;
  }

  public get userId(): UserId {
    return this._userId;
  }

  public get name(): string {
    return this._name;
  }

  public get actions(): GtdAction[] {
    return this._actions;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  // ==========
  // Business methods
  // ==========
  public rename(newName: string): void {
    this._name = newName;
    this.touch();
  }

  public addAction(action: GtdAction): void {
    this._actions.push(action);
    this.touch();
  }

  public removeAction(actionId: string): void {
    this._actions = this._actions.filter((a) => a.id !== actionId);
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  // ==========
  // Factory methods
  // ==========
  public static create(userId: UserId, name: string): Context {
    return new Context({
      userId,
      name,
    });
  }

  public static reconstitute(props: ContextProps): Context {
    return new Context(props);
  }

  // ==========
  // Conversion methods
  // ==========
  public toPlainObject() {
    return {
      id: this._id.getValue(),
      userId: this._userId.getValue(),
      name: this._name,
      actions: this._actions.map((a) => a.toPlainObject()),
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
