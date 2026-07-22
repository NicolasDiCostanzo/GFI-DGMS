import { InfiniteNumberException } from '@/shared/errors/InfiniteNumberException';
import { InvalidNumberException } from '@/shared/errors/InvalidNumberException';
import { NonPositiveNumberException } from '@/shared/errors/NonPositiveNumberException';
import { Currency } from '@/shared/types/Currency';

export class TargetBudget {
    readonly amount: number;
    readonly currency: Currency;

    constructor(amount: number, currency: Currency) {
        if (Number.isNaN(amount)) {
            throw new InvalidNumberException('TargetBudget amount must not be NaN');
        }
        if (!Number.isFinite(amount)) {
            throw new InfiniteNumberException('TargetBudget amount must be finite');
        }
        if (amount <= 0) {
            throw new NonPositiveNumberException('TargetBudget amount must be greater than 0');
        }
        this.amount = amount;
        this.currency = currency;
    }

    percentageOf(actual: number): number {
        return actual / this.amount;
    }
}
