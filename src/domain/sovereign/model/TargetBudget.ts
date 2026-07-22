import { Currency } from '@/shared/types/Currency';
import { DomainError } from './DomainError';

export class TargetBudget {
    readonly amount: number;
    readonly currency: Currency;

    constructor(amount: number, currency: Currency) {
        if (amount <= 0) {
            throw new DomainError('TargetBudget amount must be greater than 0');
        }
        this.amount = amount;
        this.currency = currency;
    }

    percentageOf(actual: number): number {
        return actual / this.amount;
    }
}
