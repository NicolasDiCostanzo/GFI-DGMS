import { InfiniteNumberException } from '@/shared/errors/InfiniteNumberException';
import { InvalidNumberException } from '@/shared/errors/InvalidNumberException';
import { NonPositiveNumberException } from '@/shared/errors/NonPositiveNumberException';
import { Currency } from '@/shared/types/Currency';
import { TargetBudget } from './TargetBudget';

export class InvestmentAmount {
    readonly value: number;
    readonly currency: Currency;
    readonly maxAllowed: number;

    constructor(value: number, currency: Currency, maxAllowed: number) {
        if (Number.isNaN(value)) {
            throw new InvalidNumberException('InvestmentAmount value must not be NaN');
        }
        if (!Number.isFinite(value)) {
            throw new InfiniteNumberException('InvestmentAmount value must be finite');
        }
        if (value < 0) {
            throw new InvalidNumberException('InvestmentAmount value must not be negative');
        }
        if (Number.isNaN(maxAllowed)) {
            throw new InvalidNumberException('InvestmentAmount maxAllowed must not be NaN');
        }
        if (!Number.isFinite(maxAllowed)) {
            throw new InfiniteNumberException('InvestmentAmount maxAllowed must be finite');
        }
        if (maxAllowed <= 0) {
            throw new NonPositiveNumberException(
                'InvestmentAmount maxAllowed must be greater than 0',
            );
        }
        if (value > maxAllowed) {
            throw new InvalidNumberException(
                'InvestmentAmount value must not exceed maxAllowed',
            );
        }
        this.value = value;
        this.currency = currency;
        this.maxAllowed = maxAllowed;
    }

    toPercentageOf(target: TargetBudget): number {
        return this.value / target.amount;
    }
}