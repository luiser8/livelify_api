import { v4 as uuidv4 } from 'uuid';

export class ProjectGoalId {
  private readonly _value: string;

  private constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('ProjectGoalId cannot be empty');
    }
    this._value = value;
  }

  public static create(): ProjectGoalId {
    return new ProjectGoalId(uuidv4());
  }

  public static fromString(value: string): ProjectGoalId {
    return new ProjectGoalId(value);
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other: ProjectGoalId): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
