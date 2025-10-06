import { BudgetId } from '../../value-objects/budget/budget-id.value-object';
import { GtdProjectId } from '../../value-objects/project/gtd-project-id.value-object';
import { CurrencyId } from '../../value-objects/currency/currency-id.value-object';
import { Currency } from '../currency/currency.entity';

export interface BudgetProps {
  id: BudgetId;
  projectId: GtdProjectId;
  monthlyIncomeTarget?: number;
  dailyIncomeTarget?: number;
  currencyId: CurrencyId;
  currency?: Currency;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Budget {
  private readonly _id: BudgetId;
  private readonly _projectId: GtdProjectId;
  private _monthlyIncomeTarget?: number;
  private _dailyIncomeTarget?: number;
  private readonly _currencyId: CurrencyId;
  private readonly _currency?: Currency;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: BudgetProps) {
    this._id = props.id;
    this._projectId = props.projectId;
    this._monthlyIncomeTarget = props.monthlyIncomeTarget;
    this._dailyIncomeTarget = props.dailyIncomeTarget;
    this._currencyId = props.currencyId;
    this._currency = props.currency;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();

    this.validate();
  }

  public static create(
    projectId: GtdProjectId,
    currencyId: CurrencyId,
    monthlyIncomeTarget?: number,
    dailyIncomeTarget?: number,
    currency?: Currency,
  ): Budget {
    return new Budget({
      id: BudgetId.create(),
      projectId,
      monthlyIncomeTarget,
      dailyIncomeTarget,
      currencyId,
      currency,
    });
  }

  public static reconstitute(props: BudgetProps): Budget {
    return new Budget(props);
  }

  private validate(): void {
    if (
      this._monthlyIncomeTarget !== undefined &&
      this._monthlyIncomeTarget < 0
    ) {
      throw new Error('Monthly income target cannot be negative');
    }
    if (this._dailyIncomeTarget !== undefined && this._dailyIncomeTarget < 0) {
      throw new Error('Daily income target cannot be negative');
    }

    // NOTA: No validamos consistencia entre IMO e IDO porque los valores
    // se calculan basándose en la duración real del proyecto, no en un mes estándar de 30 días.
    // monthlyBudget = totalCapital / meses_reales_del_proyecto
    // dailyBudget = totalCapital / días_reales_del_proyecto
    // Por lo tanto, la relación NO es necesariamente 30:1
  }

  // Business methods
  public updateMonthlyIncomeTarget(amount: number): void {
    if (amount < 0) {
      throw new Error('Monthly income target cannot be negative');
    }
    this._monthlyIncomeTarget = amount;

    // Auto-calculate daily target if not set
    if (!this._dailyIncomeTarget) {
      this._dailyIncomeTarget = amount / 30;
    }

    this.validate();
    this.touch();
  }

  public updateDailyIncomeTarget(amount: number): void {
    if (amount < 0) {
      throw new Error('Daily income target cannot be negative');
    }
    this._dailyIncomeTarget = amount;

    // Auto-calculate monthly target if not set
    if (!this._monthlyIncomeTarget) {
      this._monthlyIncomeTarget = amount * 30;
    }

    this.validate();
    this.touch();
  }

  public updateBothTargets(monthlyAmount: number, dailyAmount: number): void {
    if (monthlyAmount < 0 || dailyAmount < 0) {
      throw new Error('Income targets cannot be negative');
    }

    this._monthlyIncomeTarget = monthlyAmount;
    this._dailyIncomeTarget = dailyAmount;
    this.validate();
    this.touch();
  }

  public calculateDailyFromMonthly(): number | null {
    return this._monthlyIncomeTarget ? this._monthlyIncomeTarget / 30 : null;
  }

  public calculateMonthlyFromDaily(): number | null {
    return this._dailyIncomeTarget ? this._dailyIncomeTarget * 30 : null;
  }

  // Getters
  public get id(): BudgetId {
    return this._id;
  }

  public get projectId(): GtdProjectId {
    return this._projectId;
  }

  public get monthlyIncomeTarget(): number | undefined {
    return this._monthlyIncomeTarget;
  }

  public get dailyIncomeTarget(): number | undefined {
    return this._dailyIncomeTarget;
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
