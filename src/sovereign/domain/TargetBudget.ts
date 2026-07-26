import { NonPositiveNumberException } from '@/shared/errors/NonPositiveNumberException';
import { Currency } from '@/shared/types/Currency';
import { validateNumeric } from '@/shared/utils/validateNumeric';

export class TargetBudget {
    readonly amount: number;
    readonly currency: Currency;

    constructor(amount: number, currency: Currency) {
        validateNumeric(amount, 'TargetBudget', 'amount');
        if (amount <= 0) {
            throw new NonPositiveNumberException('TargetBudget amount must be greater than 0');
        }
        this.amount = amount;
        this.currency = currency;
    }
}
