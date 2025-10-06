import { GoalBudgetId } from '../../value-objects/goal-budget/goal-budget-id.value-object';
import { ProjectGoalId } from '../../value-objects/goal/project-goal-id.value-object';
import { CurrencyId } from '../../value-objects/currency/currency-id.value-object';
import { Currency } from '../currency/currency.entity';

export interface GoalBudgetProps {
  id: GoalBudgetId;
  goalId: ProjectGoalId;
  baseCapital: number;
  multiplier: number;
  totalCapital: number;
  monthlyBudget: number;
  dailyBudget: number;
  projectMonths: number;
  projectDays: number;
  currencyId: CurrencyId;
  currency?: Currency;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GoalBudgetCalculationInput {
  baseCapital: number;
  multiplier?: number;
  projectStartDate: Date;
  projectEndDate: Date;
}

export class GoalBudget {
  private readonly _id: GoalBudgetId;
  private readonly _goalId: ProjectGoalId;
  private _baseCapital: number;
  private _multiplier: number;
  private _totalCapital: number;
  private _monthlyBudget: number;
  private _dailyBudget: number;
  private _projectMonths: number;
  private _projectDays: number;
  private readonly _currencyId: CurrencyId;
  private readonly _currency?: Currency;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: GoalBudgetProps) {
    this._id = props.id;
    this._goalId = props.goalId;
    this._baseCapital = props.baseCapital;
    this._multiplier = props.multiplier;
    this._totalCapital = props.totalCapital;
    this._monthlyBudget = props.monthlyBudget;
    this._dailyBudget = props.dailyBudget;
    this._projectMonths = props.projectMonths;
    this._projectDays = props.projectDays;
    this._currencyId = props.currencyId;
    this._currency = props.currency;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();

    this.validate();
  }

  /**
   * Crea un nuevo presupuesto de goal con cálculos automáticos
   * Ejemplo: baseCapital = 3000, multiplier = 1.3
   * - totalCapital = 3000 * 1.3 = 3900
   * - monthlyBudget (IMO) = 3900 / meses del proyecto
   * - dailyBudget (IDO) = 3900 / días del proyecto
   */
  public static create(
    goalId: ProjectGoalId,
    currencyId: CurrencyId,
    input: GoalBudgetCalculationInput,
    currency?: Currency,
  ): GoalBudget {
    const multiplier = input.multiplier || 1.3;
    const totalCapital = Math.round(input.baseCapital * multiplier * 100) / 100;

    // Calcular meses y días del proyecto
    const { months, days } = this.calculateProjectDuration(
      input.projectStartDate,
      input.projectEndDate,
    );

    if (months <= 0 || days <= 0) {
      throw new Error('Project duration must be positive');
    }

    // Calcular IMO (monthly budget) e IDO (daily budget) con máximo 2 decimales
    const monthlyBudget = Math.round((totalCapital / months) * 100) / 100;
    const dailyBudget = Math.round((totalCapital / days) * 100) / 100;

    return new GoalBudget({
      id: GoalBudgetId.create(),
      goalId,
      baseCapital: input.baseCapital,
      multiplier,
      totalCapital,
      monthlyBudget,
      dailyBudget,
      projectMonths: months,
      projectDays: days,
      currencyId,
      currency,
    });
  }

  public static reconstitute(props: GoalBudgetProps): GoalBudget {
    return new GoalBudget(props);
  }

  /**
   * Calcula la duración del proyecto en meses y días
   */
  private static calculateProjectDuration(
    startDate: Date,
    endDate: Date,
  ): { months: number; days: number } {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calcular días totales
    const diffTime = end.getTime() - start.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calcular meses (aproximado: 30 días por mes)
    const months = Math.ceil(days / 30);

    return { months, days };
  }

  private validate(): void {
    if (this._baseCapital < 0) {
      throw new Error('Base capital cannot be negative');
    }
    if (this._multiplier <= 0) {
      throw new Error('Multiplier must be greater than zero');
    }
    if (this._totalCapital < 0) {
      throw new Error('Total capital cannot be negative');
    }
    if (this._monthlyBudget < 0) {
      throw new Error('Monthly budget cannot be negative');
    }
    if (this._dailyBudget < 0) {
      throw new Error('Daily budget cannot be negative');
    }
    if (this._projectMonths <= 0) {
      throw new Error('Project months must be greater than zero');
    }
    if (this._projectDays <= 0) {
      throw new Error('Project days must be greater than zero');
    }
  }

  // Business methods
  /**
   * Recalcula el presupuesto basado en una nueva duración del proyecto
   */
  public recalculateBudget(
    projectStartDate: Date,
    projectEndDate: Date,
  ): void {
    const { months, days } = GoalBudget.calculateProjectDuration(
      projectStartDate,
      projectEndDate,
    );

    if (months <= 0 || days <= 0) {
      throw new Error('Project duration must be positive');
    }

    this._projectMonths = months;
    this._projectDays = days;
    this._monthlyBudget = Math.round((this._totalCapital / months) * 100) / 100;
    this._dailyBudget = Math.round((this._totalCapital / days) * 100) / 100;

    this.validate();
    this.touch();
  }

  /**
   * Actualiza el capital base y recalcula todos los valores derivados
   */
  public updateBaseCapital(newBaseCapital: number): void {
    if (newBaseCapital < 0) {
      throw new Error('Base capital cannot be negative');
    }

    this._baseCapital = newBaseCapital;
    this._totalCapital = Math.round(newBaseCapital * this._multiplier * 100) / 100;
    this._monthlyBudget = Math.round((this._totalCapital / this._projectMonths) * 100) / 100;
    this._dailyBudget = Math.round((this._totalCapital / this._projectDays) * 100) / 100;

    this.validate();
    this.touch();
  }

  /**
   * Actualiza el multiplicador y recalcula todos los valores derivados
   */
  public updateMultiplier(newMultiplier: number): void {
    if (newMultiplier <= 0) {
      throw new Error('Multiplier must be greater than zero');
    }

    this._multiplier = newMultiplier;
    this._totalCapital = Math.round(this._baseCapital * newMultiplier * 100) / 100;
    this._monthlyBudget = Math.round((this._totalCapital / this._projectMonths) * 100) / 100;
    this._dailyBudget = Math.round((this._totalCapital / this._projectDays) * 100) / 100;

    this.validate();
    this.touch();
  }

  /**
   * Calcula el presupuesto acumulado hasta una fecha específica
   */
  public calculateAccumulatedBudget(currentDate: Date): number {
    const startDate = this._createdAt;
    const diffTime = currentDate.getTime() - startDate.getTime();
    const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (daysPassed <= 0) {
      return 0;
    }

    const accumulated = Math.min(this._dailyBudget * daysPassed, this._totalCapital);
    return Math.round(accumulated * 100) / 100;
  }

  /**
   * Calcula el porcentaje de presupuesto consumido
   */
  public calculateBudgetProgress(currentDate: Date): number {
    const accumulated = this.calculateAccumulatedBudget(currentDate);
    const progress = (accumulated / this._totalCapital) * 100;
    return Math.round(progress * 100) / 100;
  }

  // Getters
  public get id(): GoalBudgetId {
    return this._id;
  }

  public get goalId(): ProjectGoalId {
    return this._goalId;
  }

  public get baseCapital(): number {
    return this._baseCapital;
  }

  public get multiplier(): number {
    return this._multiplier;
  }

  public get totalCapital(): number {
    return this._totalCapital;
  }

  public get monthlyBudget(): number {
    return this._monthlyBudget;
  }

  public get dailyBudget(): number {
    return this._dailyBudget;
  }

  public get projectMonths(): number {
    return this._projectMonths;
  }

  public get projectDays(): number {
    return this._projectDays;
  }

  public get currencyId(): CurrencyId {
    return this._currencyId;
  }

  public get currency(): Currency | undefined {
    return this._currency;
  }

  public get currencyCode(): string {
    return this._currency?.code || 'Unknown';
  }

  public get currencySymbol(): string {
    return this._currency?.symbol || '$';
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
