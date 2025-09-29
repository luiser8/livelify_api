import { AreaId } from 'src/domain/value-objects/area/area-id.value-object';
import { QuestionId } from 'src/domain/value-objects/question/question-id.value-object';

// ======================
// Interfaces for related entities
// (Assuming these entities exist and have a toPlainObject method)
// ======================
interface Answer {
  id: string;
  value: boolean;
  userId: string;
  toPlainObject(): { id: string; value: boolean; userId: string };
}

// Optional: Include Area interface if you plan to load the full object.
// For now, we'll primarily work with areaId.
interface Area {
  id: string;
  name: string;
  toPlainObject(): { id: string; name: string };
}

// ======================
// Props Interface
// ======================
export interface QuestionProps {
  id?: QuestionId;
  text: string;
  areaId: AreaId;
  answers?: Answer[];
  area?: Area; // The full Area object is optional
  createdAt?: Date;
  updatedAt?: Date;
}

// ======================
// Question Entity
// ======================
export class Question {
  private readonly _id: QuestionId;
  private _text: string;
  private readonly _areaId: AreaId;
  private _answers: Answer[];
  private readonly _area?: Area; // Store the optional Area object
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: QuestionProps) {
    this._id = props.id || QuestionId.create();
    this._text = props.text;
    this._areaId = props.areaId;
    this._answers = props.answers || [];
    this._area = props.area;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  // ==========
  // Getters
  // ==========
  public get id(): QuestionId {
    return this._id;
  }

  public get text(): string {
    return this._text;
  }

  public get areaId(): AreaId {
    return this._areaId;
  }

  public get answers(): Answer[] {
    return this._answers;
  }

  public get area(): Area | undefined {
    return this._area;
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
  public updateText(newText: string): void {
    if (!newText.trim()) {
      throw new Error('Question text cannot be empty.');
    }
    this._text = newText;
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  // ==========
  // Factory methods
  // ==========
  public static create(props: { text: string; areaId: AreaId }): Question {
    return new Question({
      text: props.text,
      areaId: props.areaId,
    });
  }

  public static reconstitute(props: QuestionProps): Question {
    return new Question(props);
  }

  // ==========
  // Conversion methods
  // ==========
  public toPlainObject() {
    return {
      id: this._id.getValue(),
      text: this._text,
      areaId: this._areaId.getValue(),
      answers: this._answers.map((a) => a.toPlainObject()),
      area: this._area ? this._area.toPlainObject() : undefined,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
