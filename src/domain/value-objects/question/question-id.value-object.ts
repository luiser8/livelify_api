import { randomUUID } from 'crypto';

export class QuestionId {
  private readonly value: string;

  constructor(id?: string) {
    this.value = id || randomUUID();
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: QuestionId): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  public static create(): QuestionId {
    return new QuestionId();
  }

  public static fromString(id: string): QuestionId {
    return new QuestionId(id);
  }
}
