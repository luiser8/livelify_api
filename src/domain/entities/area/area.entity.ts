import { AreaId } from '../../value-objects/area/area-id.value-object';

// ======================
// Interfaces for related entities
// (Assuming these entities exist and have a toPlainObject method)
// ======================
interface Question {
  id: string;
  text: string;
  toPlainObject(): { id: string; text: string };
}

interface LifeWheelArea {
  id: string;
  score: number;
  toPlainObject(): { id: string; score: number };
}

interface GtdProjectDetail {
  id: string;
  status: string;
  toPlainObject(): { id: string; status: string };
}

// ======================
// Props Interface
// ======================
export interface AreaProps {
  id?: AreaId;
  name: string;
  description: string;
  questions?: Question[];
  lifeWheelAreas?: LifeWheelArea[];
  projectDetails?: GtdProjectDetail[];
  createdAt?: Date;
  updatedAt?: Date;
}

// ======================
// Area Entity
// ======================
export class Area {
  private readonly _id: AreaId;
  private _name: string;
  private _description: string;
  private _questions: Question[];
  private _lifeWheelAreas: LifeWheelArea[];
  private _projectDetails: GtdProjectDetail[];
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: AreaProps) {
    this._id = props.id || AreaId.create();
    this._name = props.name;
    this._description = props.description;
    this._questions = props.questions || [];
    this._lifeWheelAreas = props.lifeWheelAreas || [];
    this._projectDetails = props.projectDetails || [];
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  // ==========
  // Getters
  // ==========
  public get id(): AreaId {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get description(): string {
    return this._description;
  }

  public get questions(): Question[] {
    return this._questions;
  }

  public get lifeWheelAreas(): LifeWheelArea[] {
    return this._lifeWheelAreas;
  }

  public get projectDetails(): GtdProjectDetail[] {
    return this._projectDetails;
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
    if (!newName.trim()) {
      throw new Error('Area name cannot be empty.');
    }
    this._name = newName;
    this.touch();
  }

  public updateDescription(newDescription: string): void {
    if (!newDescription.trim()) {
      throw new Error('Area description cannot be empty.');
    }
    this._description = newDescription;
    this.touch();
  }

  public addQuestion(question: Question): void {
    this._questions.push(question);
    this.touch();
  }

  public removeQuestion(questionId: string): void {
    this._questions = this._questions.filter((q) => q.id !== questionId);
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  // ==========
  // Factory methods
  // ==========
  public static create(name: string, description: string): Area {
    return new Area({
      name,
      description,
    });
  }

  public static reconstitute(props: AreaProps): Area {
    return new Area(props);
  }

  // ==========
  // Conversion methods
  // ==========
  public toPlainObject() {
    return {
      id: this._id.getValue(),
      name: this._name,
      description: this._description,
      questions: this._questions.map((q) => q.toPlainObject()),
      lifeWheelAreas: this._lifeWheelAreas.map((lwa) => lwa.toPlainObject()),
      projectDetails: this._projectDetails.map((pd) => pd.toPlainObject()),
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
