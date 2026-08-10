import { NonPositiveNumberException } from '@/shared/errors/NonPositiveNumberException';
import { validateNumeric } from '@/shared/utils/validateNumeric';

export class TargetBudget {
    readonly amount: number;

    constructor(amount: number) {
        validateNumeric(amount, 'TargetBudget', 'amount');
        if (amount <= 0) {
            throw new NonPositiveNumberException('TargetBudget amount must be greater than 0');
        }
        this.amount = amount;
    }
}
