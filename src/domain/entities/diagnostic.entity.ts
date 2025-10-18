import { v4 as uuidv4 } from 'uuid';

export interface DiagnosticScores {
  personal: number;
  professional: number;
  health: number;
  finances: number;
  family: number;
  love: number;
}

export class Diagnostic {
  private readonly id: string;
  private readonly name: string;
  private readonly email: string;
  private readonly scores: DiagnosticScores;
  private readonly average: number;
  private readonly createdAt: Date;

  private constructor(
    id: string,
    name: string,
    email: string,
    scores: DiagnosticScores,
    average: number,
    createdAt: Date,
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.scores = scores;
    this.average = average;
    this.createdAt = createdAt;
  }

  static create(
    name: string,
    email: string,
    scores: DiagnosticScores,
    average: number,
  ): Diagnostic {
    return new Diagnostic(uuidv4(), name, email, scores, average, new Date());
  }

  static fromPrimitives(data: {
    id: string;
    name: string;
    email: string;
    scores: DiagnosticScores;
    average: number;
    createdAt: Date;
  }): Diagnostic {
    return new Diagnostic(
      data.id,
      data.name,
      data.email,
      data.scores,
      data.average,
      data.createdAt,
    );
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getEmail(): string {
    return this.email;
  }

  getScores(): DiagnosticScores {
    return this.scores;
  }

  getAverage(): number {
    return this.average;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  toPlainObject() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      scores: this.scores,
      average: this.average,
      createdAt: this.createdAt,
    };
  }
}
